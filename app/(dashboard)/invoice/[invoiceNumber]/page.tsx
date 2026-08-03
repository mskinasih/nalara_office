import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import InvoiceActions from "./InvoiceActions"

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number)
}

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(date)
}

const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
}

const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export default async function InvoiceDetailPage({
    params
}: {
    params: Promise<{ invoiceNumber: string }>
}) {
    const { invoiceNumber } = await params

    const invoice = await prisma.invoice.findUnique({
        where: { invoiceNumber },
        include: { student: true }
    })

    if (!invoice) {
        notFound()
    }

    return (
        <div className="font-['Lexend',_sans-serif] text-slate-800 w-full">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-container {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                }
            `}} />

            <div className="flex flex-col items-center">
                {/* BEGIN: Action Header (Screen Only) */}
                <header className="no-print w-full max-w-[297mm] mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2">
                        <Link href="/invoice" className="text-[#00A36C] hover:underline flex items-center gap-2 text-sm font-bold">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Kembali ke Daftar Invoice
                        </Link>
                    </div>
                    <InvoiceActions
                        invoiceNumber={invoice.invoiceNumber}
                        studentName={invoice.student.name}
                        sessionCount={invoice.sessionCount}
                        totalAmount={invoice.total}
                    />
                </header>
                {/* END: Action Header */}

                {/* BEGIN: Main Invoice Container Wrapper */}
                <div className="w-full overflow-x-auto pb-8">
                    <main id="invoice-printable" className="print-container mx-auto min-w-[297mm] min-h-[210mm] bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-[15mm] rounded-xl flex flex-col justify-between">
                        <div className="flex-grow">
                            {/* BEGIN: Header Section */}
                            <section className="flex justify-between items-start mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#00A36C] p-3 rounded-xl shadow-sm">
                                        <svg className="text-white h-8 w-8" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                            <path d="M7 7H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                            <path d="M7 12H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                            <path d="M7 17H13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-[#00A36C] leading-tight">Invoice Bimbingan Belajar</h1>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block bg-[#E9FFDB] px-4 py-1.5 rounded-full mb-4">
                                        <span className="text-[#00A36C] font-bold text-sm"> #{invoice.invoiceNumber}</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-slate-500">Tanggal:</span> <span className="font-bold text-slate-900">{formatDate(invoice.createdAt)}</span></p>
                                    </div>
                                </div>
                            </section>
                            {/* END: Header Section */}

                            {/* BEGIN: Service & Meta Info */}
                            <section className="mb-8">
                                <div className="bg-[#f8fcf9] border border-[#00A36C]/20 p-6 rounded-xl flex items-center justify-between">
                                    <div>
                                        <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Ditagihkan Kepada (Nama Siswa)</label>
                                        <p className="text-lg font-bold text-slate-900">{invoice.student.name}</p>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200"></div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Jenjang</label>
                                        <p className="text-base font-bold text-slate-900">{invoice.student.jenjang}</p>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200"></div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Kelas</label>
                                        <p className="text-base font-bold text-slate-900">{invoice.student.kelas}</p>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200"></div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Tipe Bimbingan</label>
                                        <p className="text-base font-bold text-slate-900 capitalize">{invoice.student.type}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8 border-b border-slate-100 pb-8">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest border-b border-slate-100">
                                            <th className="text-left pb-4">Deskripsi</th>
                                            <th className="text-right pb-4 px-4">Harga / Sesi</th>
                                            <th className="text-right pb-4 px-4">Jumlah (Sesi)</th>
                                            <th className="text-right pb-4">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr>
                                            <td className="py-5 font-bold text-slate-900">
                                                Biaya Les ({MONTHS[invoice.month - 1]} {invoice.year})
                                            </td>
                                            <td className="py-5 px-4 text-right font-medium text-slate-600">{formatRupiah(invoice.basePrice)}</td>
                                            <td className="py-5 px-4 text-right font-medium text-slate-600">{invoice.sessionCount}</td>
                                            <td className="py-5 text-right font-bold text-slate-900">{formatRupiah(invoice.basePrice * invoice.sessionCount)}</td>
                                        </tr>
                                        {invoice.transportPrice > 0 && (
                                            <tr>
                                                <td className="py-5 font-bold text-slate-900">
                                                    Biaya Transport Tambahan
                                                    <span className="block text-xs text-slate-500 font-normal mt-1">Siswa luar area (&gt;5km)</span>
                                                </td>
                                                <td className="py-5 px-4 text-right font-medium text-slate-600">{formatRupiah(invoice.transportPrice)}</td>
                                                <td className="py-5 px-4 text-right font-medium text-slate-600">{invoice.sessionCount}</td>
                                                <td className="py-5 text-right font-bold text-slate-900">{formatRupiah(invoice.transportPrice * invoice.sessionCount)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Financial Summary */}
                                <div className="mt-6 flex justify-end">
                                    <div className="w-1/2">
                                        <div className="flex justify-between mb-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                                            <span className="text-sm font-bold text-slate-700">{formatRupiah(invoice.total)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t-2 border-[#00A36C] pt-4">
                                            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total Tagihan</span>
                                            <span className="text-3xl font-black text-[#00A36C]">{formatRupiah(invoice.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* END: Service & Meta Info */}
                        </div>

                        {/* BEGIN: Footer */}
                        <footer className="mt-auto border-t border-slate-100 pt-8 flex justify-between items-end">
                            <div className="max-w-md">
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Terima kasih telah mempercayakan Nalara Privat!</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    Semoga kerja sama ini terus memberikan manfaat yang terbaik.<br />
                                </p>
                            </div>
                        </footer>
                        {/* END: Footer */}
                    </main>
                </div>
                {/* END: Main Invoice Container Wrapper */}
            </div>
        </div>
    )
}
