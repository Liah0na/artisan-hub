import { NextRequest, NextResponse } from "next/server";
import { ProductResponse, ErrorResponse } from "@/lib/api/responses";
import { getProductById } from "@/lib/services/product.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json<ErrorResponse>(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ProductResponse>({ product });

  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}