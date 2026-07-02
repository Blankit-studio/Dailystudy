"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-10 text-center">
        <div className="text-5xl">😵</div>
        <h1 className="mt-4 text-xl font-bold text-fg">문제가 발생했어요</h1>
        <p className="mt-2 text-sm text-muted">
          일시적인 오류일 수 있어요. 다시 시도해 주세요.
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs text-subtle">오류 코드: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            다시 시도
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-fg transition hover:bg-muted-bg"
          >
            대시보드로
          </a>
        </div>
      </div>
    </div>
  );
}
