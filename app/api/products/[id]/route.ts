import { NextResponse } from "next/server";
import { ProductResponse, ErrorResponse } from "@/lib/api/responses";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<ProductResponse | ErrorResponse>> {

  //const product = await getProductFromDB(params.id);
  const product = {} as ProductResponse["product"];

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    product
  });
} 