"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { errMsg } from "@/lib/format";
import type { ResultData } from "@/lib/types";
import { Loading, Notice, PageTitle } from "@/components/ui";
import ResultView from "@/components/ResultView";

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<ResultData>(`/attempts/${attemptId}/result`)
      .then(setData)
      .catch((e) => {
        // Still answering: send the student back to the exam screen.
        if (e instanceof ApiError && e.status === 409) router.replace(`/student/exam/${attemptId}`);
        else setError(errMsg(e));
      });
  }, [attemptId, router]);

  if (error) {
    return (
      <>
        <Notice tone="bad">{error}</Notice>
        <p className="mt-4"><Link href="/student/dashboard" className="btn">Back to your exams</Link></p>
      </>
    );
  }
  if (!data) return <Loading />;

  return (
    <>
      <PageTitle title={data.exam.title}>
        <Link href="/student/dashboard" className="btn">Back to your exams</Link>
      </PageTitle>
      <ResultView data={data} />
    </>
  );
}
