import VerifyOtp from "@/components/VerifyOtp";
import { Suspense } from "react";
import Loading from "@/components/Loading";

const VerifyPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOtp />
    </Suspense>
  );
};

export default VerifyPage;
