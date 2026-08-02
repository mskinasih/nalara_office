import { prisma } from "@/lib/prisma"

import { NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { date, startTime, endTime } = body

        const schedule = await prisma.schedule.update({
            where: { id },
            data: {
                ...(date ? { date: new Date(date) } : {}),
                ...(startTime ? { startTime } : {}),
                ...(endTime ? { endTime } : {}),
            },
            include: {
                student: true
            }
        })

        return NextResponse.json(schedule)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.schedule.delete({ where: { id } })
        return NextResponse.json({ message: "Schedule deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 })
    }
}
