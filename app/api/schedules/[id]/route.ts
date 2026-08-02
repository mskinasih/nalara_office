import { prisma } from "@/lib/prisma"
import { Day } from "@prisma/client"
import { NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { day, startTime, endTime } = body

        if (day && !Object.values(Day).includes(day as Day)) {
            return NextResponse.json(
                { error: `day must be one of: ${Object.values(Day).join(", ")}` },
                { status: 400 }
            )
        }

        const schedule = await prisma.schedule.update({
            where: { id },
            data: {
                ...(day ? { day } : {}),
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
