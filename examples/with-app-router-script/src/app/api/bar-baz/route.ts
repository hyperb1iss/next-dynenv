import { env } from 'next-dynenv'

export async function GET() {
    return Response.json({
        bar: env('BAR'), // This is the same as process.env.BAR
        baz: process.env.BAZ,
    })
}
