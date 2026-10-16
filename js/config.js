/*
 * Hello Archive jr 랜딩페이지 설정 파일
 * ------------------------------------------------------------
 * 운영 중 바꿔야 하는 값은 모두 이 파일 한 곳에서 관리합니다.
 * 값이 비어 있으면 해당 기능은 "준비 중" 상태로 동작하며,
 * 임의의 URL이나 가짜 데이터를 만들지 않습니다.
 */
window.HELLO_ARCHIVE_JR_CONFIG = {
  // 1) 사전 신청 Google Forms 주소 (모든 CTA 버튼이 이 주소로 연결됩니다)
  //    예) "https://docs.google.com/forms/d/e/<폼ID>/viewform"
  //    비워 두면 버튼을 눌렀을 때 "사전 신청 준비 중" 안내가 표시됩니다.
  GOOGLE_FORM_URL: "",

  // 2) (선택) 유입 채널을 폼 응답에 함께 남기고 싶을 때
  //    Google Forms "미리 채워진 링크 가져오기"로 확인한 단답형 항목의 ID. 예) "entry.1234567890"
  //    docs.google.com 주소일 때만 동작합니다. 비워 두면 사용하지 않습니다.
  FORM_SOURCE_FIELD: "",

  // 3) (선택) GA4 측정 ID. 예) "G-XXXXXXXXXX"
  //    비워 두면 분석 스크립트를 불러오지 않고 이벤트도 전송하지 않습니다.
  GA4_MEASUREMENT_ID: "",

  // 4) A/B 비교용 사이트 식별자 (모든 GA4 이벤트에 site_variant 값으로 붙습니다)
  SITE_VARIANT: "hello_archive_jr",

  // 5) (선택) 푸터에 표시할 운영자 정보. 비워 두면 표시하지 않습니다.
  OPERATOR_NAME: "",
  CONTACT_EMAIL: "",
  PRIVACY_POLICY_URL: ""
};
