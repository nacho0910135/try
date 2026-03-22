import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams?.token || "";

  return <ResetPasswordForm token={token} />;
}
