// DEPRECATED: Booking page replaced by ConsultationPage
// This file exists only for backward compatibility. It redirects to /consultation.
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function BookingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/consultation", { replace: true });
  }, [navigate]);
  return null;
}
