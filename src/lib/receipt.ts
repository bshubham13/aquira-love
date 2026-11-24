import type { ProposalData } from './proposal'

export interface ReceiptLine {
  id: string
  label: string
  amount: string
  kind: 'item' | 'gag' | 'memo'
}

export function receiptHeader(data: ProposalData): string[] {
  return [
    data.diner.toUpperCase(),
    'OPEN 25 HOURS · EST. TONIGHT',
    '--------------------------------',
    `SERVER: A.Q. UNIT-01`,
    `TABLE: 02 (you + ${data.to})`,
    '--------------------------------',
  ]
}

export function receiptFooter(data: ProposalData): string[] {
  return [
    '--------------------------------',
    'THANK YOU FOR CHOOSING US.',
    `SEE YOU EVERY NIGHT, ${data.to.toUpperCase()}.`,
  ]
}