import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"
import { NextResponse } from "next/server"

function generateInvoiceNumber() {
    const now = new Date()
    const year = String(now.getFullYear()).slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(1000 + Math.random() * 9000)
    return `#RBN-${month}${year}-${random}`
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status") as InvoiceStatus | null
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const invoices = await prisma.invoice.findMany({
        where: {
            ...(studentId ? { studentId } : {}),
            ...(status ? { status } : {}),
            ...(month ? { month: parseInt(month) } : {}),
            ...(year ? { year: parseInt(year) } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
            student: {
                select: { id: true, name: true, kelas: true, jenjang: true, type: true }
            }
        }
    })

    return NextResponse.json(invoices)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { studentId, month, year } = body

        if (!studentId || !month || !year) {
            return NextResponse.json(
                { error: "studentId, month, and year are required" },
                { status: 400 }
            )
        }

        // Validasi: 1 siswa hanya boleh punya 1 invoice per bulan/tahun
        const existing = await prisma.invoice.findFirst({
            where: { studentId, month, year }
        })
        if (existing) {
            return NextResponse.json(
                { error: "Invoice for this student, month, and year already exists" },
                { status: 409 }
            )
        }

        const student = await prisma.student.findUnique({ where: { id: studentId } })
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 })
        }

        const pricing = await prisma.pricing.findFirst({
            where: { 
                jenjang: { equals: student.jenjang, mode: 'insensitive' }, 
                type: { equals: student.type, mode: 'insensitive' } 
            }
        })
        if (!pricing) {
            return NextResponse.json({ error: "Pricing not found for this student" }, { status: 404 })
        }

        // Hitung sessionCount otomatis dari Attendance "Hadir" bulan tersebut
        const startOfMonth = new Date(year, month - 1, 1)
        const endOfMonth = new Date(year, month, 0, 23, 59, 59)

        const sessionCount = await prisma.attendance.count({
            where: {
                studentId,
                status: "Hadir",
                date: { gte: startOfMonth, lte: endOfMonth }
            }
        })

        if (sessionCount === 0) {
            return NextResponse.json(
                { error: "No 'Hadir' attendance found for this student in the given month/year" },
                { status: 400 }
            )
        }

        const transportPrice = student.isLongDistance ? 10000 : 0
        const finalPricePerSession = pricing.price + transportPrice
        const total = finalPricePerSession * sessionCount

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber: generateInvoiceNumber(),
                studentId,
                month,
                year,
                sessionCount,
                basePrice: pricing.price,
                transportPrice,
                finalPricePerSession,
                total,
                status: "unpaid",
            },
            include: {
                student: {
                    select: { id: true, name: true, kelas: true, jenjang: true, type: true }
                }
            }
        })

        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }
}
