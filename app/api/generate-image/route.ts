import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const token = process.env.HUGGING_FACE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "HUGGING_FACE_TOKEN missing" },
        { status: 500 },
      );
    }

    console.log("Token:", token.substring(0, 8) + "...");
    console.log("Prompt:", prompt);

    // Try models in order until one works
    const models = [
      "black-forest-labs/FLUX.1-schnell",
      "stabilityai/sdxl-turbo",
    ];

    let lastError = "";

    for (const model of models) {
      console.log("Trying model:", model);

      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/" + model,

        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
            Accept: "image/png",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: 4,
              guidance_scale: 3.5,
            },
          }),
        },
      );

      console.log("Status for", model, ":", response.status);

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString("base64");
        const imageUrl = "data:image/jpeg;base64," + base64;
        console.log("Success with model:", model);
        return NextResponse.json({ imageUrl, model });
      }

      const errorText = await response.text();
      console.log("Error for", model, ":", errorText);
      lastError = errorText;

      // If model is loading, wait and retry once
      if (response.status === 503) {
        console.log("Model loading, waiting 10 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 10000));

        const retry = await fetch(
          "https://api-inference.huggingface.co/models/" + model,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
              Accept: "image/png",
            },
            body: JSON.stringify({ inputs: prompt }),
          },
        );

        if (retry.ok) {
          const imageBuffer = await retry.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString("base64");
          const imageUrl = "data:image/png;base64," + base64;
          return NextResponse.json({ imageUrl, model });
        }
      }
    }

    return NextResponse.json(
      {
        error: "All models failed. Last error: " + lastError,
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error:
          "Failed: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}
