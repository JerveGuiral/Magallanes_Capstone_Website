export type Official = {
  name: string;
  post: string;
  group: 'Executive' | 'Sangguniang Bayan' | 'Department Heads';
  term?: string;
};

export const OFFICIALS: Official[] = [
{ name: 'Hon. Isidro C. Villanueva', post: 'Municipal Mayor', group: 'Executive', term: '2025–2028' },
{ name: 'Hon. Aurora M. Bagsic', post: 'Municipal Vice Mayor', group: 'Executive', term: '2025–2028' },

{ name: 'Hon. Rodolfo T. Ampatuan', post: 'SB Member · Committee on Appropriations', group: 'Sangguniang Bayan' },
{ name: 'Hon. Marissa L. Obrero', post: 'SB Member · Committee on Health', group: 'Sangguniang Bayan' },
{ name: 'Hon. Nestor P. Cabahug', post: 'SB Member · Committee on Agriculture & Fisheries', group: 'Sangguniang Bayan' },
{ name: 'Hon. Editha S. Ramos', post: 'SB Member · Committee on Education', group: 'Sangguniang Bayan' },
{ name: 'Hon. Alfredo B. Lumocso', post: 'SB Member · Committee on Infrastructure', group: 'Sangguniang Bayan' },
{ name: 'Hon. Corazon D. Yañez', post: 'SB Member · Committee on Women & Family', group: 'Sangguniang Bayan' },
{ name: 'Hon. Wilfredo A. Estrada', post: 'SB Member · Committee on Environment', group: 'Sangguniang Bayan' },
{ name: 'Hon. Jocelyn R. Pacana', post: 'SB Member · Committee on Peace & Order', group: 'Sangguniang Bayan' },

{ name: 'Atty. Rolando P. Sarmiento', post: 'Municipal Administrator', group: 'Department Heads' },
{ name: 'Ms. Gemma R. Salcedo', post: 'Municipal Treasurer', group: 'Department Heads' },
{ name: 'Engr. Luzviminda A. Cortes', post: 'Municipal Engineer', group: 'Department Heads' },
{ name: 'Dr. Feliciano B. Uy', post: 'Municipal Health Officer', group: 'Department Heads' },
{ name: 'Mr. Ernesto V. Dalisay', post: 'Municipal Planning & Development Coordinator', group: 'Department Heads' },
{ name: 'Ms. Perlita G. Añora', post: 'Municipal Social Welfare & Development Officer', group: 'Department Heads' },
{ name: 'Mr. Bienvenido S. Tabada', post: 'Municipal Agriculturist', group: 'Department Heads' },
{ name: 'Ms. Sheila M. Ordoñez', post: 'Municipal Civil Registrar', group: 'Department Heads' }];


export type Disclosure = {
  title: string;
  period: string;
  format: string;
};

export const DISCLOSURES: Disclosure[] = [
{ title: 'Annual Budget and Statement of Receipts', period: 'FY 2026', format: 'PDF · 1.8 MB' },
{ title: 'Annual Investment Program', period: 'FY 2026', format: 'PDF · 940 KB' },
{ title: 'Statement of Debt Service', period: '2nd Quarter 2026', format: 'PDF · 320 KB' },
{ title: 'Bid Results on Goods, Services and Infrastructure', period: '2nd Quarter 2026', format: 'PDF · 610 KB' },
{ title: 'Report of Local Disaster Risk Reduction Fund Utilization', period: '2nd Quarter 2026', format: 'PDF · 480 KB' },
{ title: 'Special Education Fund Utilization', period: '2nd Quarter 2026', format: 'PDF · 260 KB' },
{ title: 'Trust Fund Utilization', period: '2nd Quarter 2026', format: 'PDF · 210 KB' },
{ title: 'Citizen’s Charter / Manual of Operations', period: '2026 Edition', format: 'PDF · 3.2 MB' }];


export const SEAL_REQUIREMENTS = [
'Annual budget report posted within 30 days of enactment',
'Quarterly statement of cash flow and debt service',
'Procurement records, including bid results and notices of award',
'Itemized utilization of the Local Disaster Risk Reduction and Management Fund',
'Statement of assets, liabilities and net worth filing compliance'];