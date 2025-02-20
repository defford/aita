export interface Personality {
  name: string
  title: string
  perspective: string
}

export interface VerdictInfo {
  text: string
  colorScheme: string
}

export interface Analysis {
  content: string
  verdicts: {
    user: VerdictType
    others: VerdictType
  }
}

export type VerdictType = 'YTA' | 'NTA' | 'UNDECIDED'

export interface AnalysisResponse {
  [key: string]: Analysis
}
