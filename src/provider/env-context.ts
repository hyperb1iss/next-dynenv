import { createContext } from 'react'

import { type ProcessEnv } from '../typings/process-env.js'

export const EnvContext = createContext<ProcessEnv | null>(null)
