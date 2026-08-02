import { prisma } from "@/lib/prisma"
import { Day } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")

    const schedules = await prisma.schedule.findMany({
        where: studentId ? { studentId } : undefined,
        include: {
            student: true
        },
        orderBy: { day: "asc" }
    })

    return NextResponse.json(schedules)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { studentId, day, startTime, endTime } = body

        if (!studentId || !day || !startTime || !endTime) {
            return NextResponse.json(
                { error: "studentId, day, startTime, and endTime are required" },
                { status: 400 }
            )
        }

        // Validate day enum
        if (!Object.values(Day).includes(day as Day)) {
            return NextResponse.json(
                { error: `day must be one of: ${Object.values(Day).join(", ")}` },
                { status: 400 }
            )
        }

        const student = await prisma.student.findUnique({ where: { id: studentId } })
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 })
        }

        const schedule = await prisma.schedule.create({
            data: { studentId, day, startTime, endTime },
            include: {
                student: true
            }
        })

        return NextResponse.json(schedule, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
    }
}
