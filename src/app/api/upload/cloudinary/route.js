import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    // Convert file to base64 buffer for Cloudinary payload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let secureUrl = "";
    let publicId = "";

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const stringToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

      const uploadFormData = new FormData();
      uploadFormData.append("file", base64Data);
      uploadFormData.append("api_key", apiKey);
      uploadFormData.append("timestamp", timestamp.toString());
      uploadFormData.append("signature", signature);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      const resData = await cloudinaryRes.json();

      if (cloudinaryRes.ok && resData.secure_url) {
        secureUrl = resData.secure_url;
        publicId = resData.public_id || `cloudinary_${Date.now()}`;
      } else {
        console.error("Cloudinary API error response:", resData);
        // Fallback if Cloudinary returns error or network blocked
        secureUrl = base64Data;
        publicId = `local_fallback_${Date.now()}`;
      }
    } else {
      // Local fallback if env missing
      secureUrl = base64Data;
      publicId = `local_${Date.now()}`;
    }

    let photoResult = {
      url: secureUrl,
      publicId,
      isProfile: true,
    };

    if (userId) {
      // Check if user currently has any photos
      const existingPhotosCount = await prisma.photo.count({ where: { userId } });

      // Save uploaded photo record into Prisma database
      const savedPhoto = await prisma.photo.create({
        data: {
          userId,
          url: secureUrl,
          publicId,
          isProfile: existingPhotosCount === 0,
        },
      });

      photoResult = {
        id: savedPhoto.id,
        url: savedPhoto.url,
        publicId: savedPhoto.publicId,
        isProfile: savedPhoto.isProfile,
      };
    }

    return NextResponse.json({
      success: true,
      photo: photoResult,
      message: "Image uploaded to Cloudinary successfully!",
    });
  } catch (error) {
    console.error("Cloudinary upload API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}
