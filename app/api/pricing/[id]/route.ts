import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await req.json()

        const pricing = await prisma.pricing.update({
            where: { id },
            data: {
                price: body.price,
                ...(body.jenjang && { jenjang: body.jenjang }),
                ...(body.type && { type: body.type }),
            },
        })

        return NextResponse.json(pricing)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        await prisma.pricing.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to delete pricing" }, { status: 500 })
    }
}
