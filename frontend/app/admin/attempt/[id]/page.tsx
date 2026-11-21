"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { errMsg } from "@/lib/format";
import type { ResultData } from "@/lib/types";
import { Loading, Notice, PageTitle } from "@/components/ui";
import ResultView from "@/components/ResultView";

export default function AdminAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await api<ResultData>(`/attempts/${id}/result`));
      setError("");
    } catch (e) {
      setError(errMsg(e));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <>
        <Notice tone="bad">{error}</Notice>
        <p className="mt-4"><Link href="/admin/dashboard" className="btn">Back to exams</Link></p>
      </>
    );
  }
  if (!data) return <Loading />;

  return (
    <>
      <PageTitle title={`${data.student.name}: ${data.exam.title}`}>
        <Link href={`/admin/exams/${data.exam.id}`} className="btn">Back to exam</Link>
      </PageTitle>
      <ResultView data={data} canGrade onGraded={load} />
    </>
  );
}
