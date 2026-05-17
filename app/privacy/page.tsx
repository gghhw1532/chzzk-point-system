import PageContainer from "@/components/PageContainer";

export default function PrivacyPage() {
  return (
    <PageContainer>
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">개인정보 및 서비스 이용 안내</h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          치지직 포인트 시스템은 방송 참여 보상, 출석, 상점, 승부예측,
          디스코드 알림 연동을 위해 필요한 최소한의 정보만 사용합니다.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold">수집하는 정보</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
              <li>치지직 채널 ID</li>
              <li>치지직 닉네임</li>
              <li>프로필 이미지</li>
              <li>채팅, 후원, 구독, 출석, 상점 구매, 승부예측 기록</li>
              <li>디스코드 연동 시 디스코드 사용자 ID</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold">사용 목적</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
              <li>포인트 자동 지급 및 차감</li>
              <li>출석 및 시청 인증 처리</li>
              <li>상점 구매 처리</li>
              <li>승부예측 참여 및 정산</li>
              <li>디스코드 DM 및 서버 알림 발송</li>
              <li>관리자 페이지에서 유저 활동 내역 확인</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold">저장하지 않는 정보</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              사용자의 치지직/네이버 비밀번호는 저장하지 않습니다.
              로그인은 치지직 OAuth 인증을 통해 처리됩니다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold">스트리머 계정 안내</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              스트리머 계정으로 로그인하는 경우 방송 채팅, 후원, 구독 이벤트
              감지 및 방송 연동 기능을 위해 토큰이 사용될 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold">문의</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              서비스 이용 중 개인정보 또는 포인트 기록 관련 문의가 필요한 경우
              방송 관리자에게 문의해주세요.
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}