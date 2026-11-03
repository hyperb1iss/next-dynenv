import { env } from 'next-dynenv'

export function GET() {
    return Response.json({
        bar: env('BAR') ?? null,
        baz: env('BAZ') ?? null,
    })
}
