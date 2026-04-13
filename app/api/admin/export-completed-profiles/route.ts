import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getCompletedProfilesForExport } from "@/lib/queries";

function csvEscape(value: unknown) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    await requireAdminUser();

    const rows = await getCompletedProfilesForExport();
    const header = [
      "Full Name",
      "Email",
      "Gender",
      "City",
      "State",
      "Phone",
      "Age",
      "Initiated",
      "Rounds",
      "Education",
      "Profession",
      "Salary",
      "Relocate",
      "Counsellor",
      "Family Phone",
      "Profile Photo URL",
      "Completed Status",
      "Updated At",
    ];

    const csvRows = rows.map((row) => {
      const answers = (row.questionnaire?.answers as Record<string, unknown> | undefined) ?? {};

      return [
        row.user.fullName ?? "",
        row.user.email,
        answers.gender ?? row.devoteeProfile?.gender ?? "",
        answers.city ?? row.devoteeProfile?.city ?? "",
        answers.state ?? row.devoteeProfile?.state ?? "",
        answers.phone ?? "",
        row.devoteeProfile?.age ?? "",
        answers.isInitiated ?? "",
        answers.rounds ?? row.devoteeProfile?.rounds ?? "",
        answers.education ?? "",
        answers.profession ?? "",
        answers.salary ?? "",
        answers.relocate ?? "",
        answers.counsellor ?? "",
        answers.familyPhone ?? "",
        row.photo?.publicUrl ?? "",
        row.user.onboardingStatus,
        row.user.updatedAt.toISOString(),
      ]
        .map(csvEscape)
        .join(",");
    });

    const csv = [header.map(csvEscape).join(","), ...csvRows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="completed-profiles-export.csv"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to export completed profiles." }, { status: 500 });
  }
}
