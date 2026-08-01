import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await req.json()

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                ...(body.status && { status: body.status }),
            },
        })

        return NextResponse.json(invoice)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        await prisma.invoice.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
    }
}
