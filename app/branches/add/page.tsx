"use client";
import React from "react";
import AddBranchForm from "../components/AddBranchForm";
import Sidebar from "../../components/layout/sidebar";
import { useRouter } from "next/navigation";

const AddBranchPage = () => {
	const router = useRouter();
	return (
		<div className="flex min-h-screen bg-[#eaf1fb]">
			<Sidebar role="admin" />
					<main className="flex-1 p-10 flex flex-col items-center justify-center relative">
								<button
									onClick={() => router.back()}
									className="absolute top-0 left-0 mt-2 ml-2 flex items-center gap-2 px-4 py-2 bg-white rounded shadow hover:bg-gray-100 text-[#0047ab] font-semibold"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
									Back
								</button>
						<AddBranchForm />
					</main>
		</div>
	);
};

export default AddBranchPage;
