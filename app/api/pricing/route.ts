import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const pricing = await prisma.pricing.findMany({
        orderBy: [{ jenjang: "asc" }, { type: "asc" }]
    })

    return NextResponse.json(pricing)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const pricing = await prisma.pricing.create({
            data: {
                jenjang: body.jenjang,
                type: body.type,
                price: body.price,
            }
        })
        return NextResponse.json(pricing, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create pricing" }, { status: 500 })
    }
}
