// // File: src/Analytics/components/BudgetVsSpendChart.tsx

// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
// import type { BudgetVsActualPoint } from '../../types';

// interface Props {
//   data: BudgetVsActualPoint[];
// }

// const BudgetVsSpendChart: React.FC<Props> = ({ data }) => {
//   const formatXAxis = (tickItem: string) => new Date(tickItem + '-02').toLocaleString('default', { month: 'short' });

//   return (
//     <div className="bg-white p-4 rounded-xl shadow-sm">
//       <h3 className="font-semibold mb-2">Budget Vs Spend</h3>
//       <div className="h-60">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" tickFormatter={formatXAxis} />
//             <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
//             <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
//             <Legend />
//             <Bar dataKey="budget" fill="#60a5fa" name="Budget" />
//             <Bar dataKey="actual" fill="#f87171" name="Spend" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };
// export default BudgetVsSpendChart;