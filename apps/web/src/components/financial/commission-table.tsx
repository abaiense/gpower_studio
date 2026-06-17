'use client';

interface ArtistSummaryRow {
  artistId: string;
  artistName: string;
  sessions: number;
  revenue: number;
  artistEarns: number;
  studioEarns: number;
}

interface CommissionTableProps {
  artistSummary: ArtistSummaryRow[];
}

export function CommissionTable({ artistSummary }: CommissionTableProps) {
  if (artistSummary.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-4 text-center">
        Nenhuma sessão concluída neste dia.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 font-semibold text-slate-700 rounded-tl-lg">
              Artista
            </th>
            <th className="text-right px-4 py-3 font-semibold text-slate-700">Sessões</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-700">Faturamento</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-700">Artista Recebe</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-700 rounded-tr-lg">
              Estúdio Fica
            </th>
          </tr>
        </thead>
        <tbody>
          {artistSummary.map((row, index) => (
            <tr
              key={row.artistId}
              className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              <td className="px-4 py-3 font-medium text-slate-900">{row.artistName}</td>
              <td className="px-4 py-3 text-right text-slate-600">{row.sessions}</td>
              <td className="px-4 py-3 text-right text-slate-900">
                R$ {row.revenue.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-emerald-600">
                R$ {row.artistEarns.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-amber-600">
                R$ {row.studioEarns.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        {artistSummary.length > 1 && (
          <tfoot>
            <tr className="bg-slate-100 font-semibold">
              <td className="px-4 py-3 text-slate-900 rounded-bl-lg">Total</td>
              <td className="px-4 py-3 text-right text-slate-900">
                {artistSummary.reduce((s, r) => s + r.sessions, 0)}
              </td>
              <td className="px-4 py-3 text-right text-slate-900">
                R${' '}
                {artistSummary.reduce((s, r) => s + r.revenue, 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-emerald-600">
                R${' '}
                {artistSummary.reduce((s, r) => s + r.artistEarns, 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-amber-600 rounded-br-lg">
                R${' '}
                {artistSummary.reduce((s, r) => s + r.studioEarns, 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
