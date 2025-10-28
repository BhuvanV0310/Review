import React from "react";
import { Branch } from "./AddBranchForm";

type BranchWithStatus = Branch & { status: "active" | "inactive" };

interface BranchTableProps {
  branches: BranchWithStatus[];
}


const BranchTable: React.FC<BranchTableProps> = ({ branches }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
      <table className="min-w-full border border-gray-200 text-center">
        <thead>
          <tr className="bg-[#0047ab] text-white">
            <th className="py-3 px-6 font-semibold">Name</th>
            <th className="py-3 px-6 font-semibold">Location</th>
            <th className="py-3 px-6 font-semibold">Review Link</th>
            <th className="py-3 px-6 font-semibold">Contact No</th>
            <th className="py-3 px-6 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch, idx) => (
            <tr key={idx} className="border-b hover:bg-blue-50 transition-all">
              <td className="py-3 px-6 align-middle">{branch.name}</td>
              <td className="py-3 px-6 align-middle">{branch.location}</td>
              <td className="py-3 px-6 align-middle">
                <a href={branch.reviewLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View Review
                </a>
              </td>
              <td className="py-3 px-6 align-middle">{branch.contactNo}</td>
              <td className="py-3 px-6 align-middle">
                {branch.status ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${branch.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">Unknown</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchTable;
