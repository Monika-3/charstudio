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
      return NextResponse.json({ error: "API token missing" }, { status: 500 });
    }

    console.log("Generating image with prompt:", prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ` + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: 512,
            height: 768,
            num_inference_steps: 20,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("HuggingFace error:", error);
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 },
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const imageUrl = `data:image/jpeg;base64,` + base64;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
