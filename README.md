# Hello Archive jr 랜딩페이지

매주 하나의 질문으로 아이의 성장을 기록하고, 한 달·세 달·일 년마다 결과물을 만들어 주는 서비스의 **사전 신청(수요 검증)용 랜딩페이지**입니다.
HTML5 + CSS3 + Vanilla JS만 사용하며 빌드 과정이 없습니다. GitHub Pages에 그대로 올릴 수 있습니다.

> 이 저장소는 기존 Hello_Archive 사이트와 **완전히 독립**되어 있습니다. 기존 파일·저장소·remote를 건드리지 않습니다.

```
.
├── index.html          # 전체 페이지 (시맨틱 마크업, SEO/OG 메타)
├── css/style.css       # 디자인 토큰(:root) + 모든 스타일
├── js/
│   ├── config.js       # ★ 운영 설정값 (Google Form URL, GA4 ID 등)
│   └── main.js         # 인터랙션 · CTA 연결 · 분석 이벤트
├── assets/images/
│   ├── favicon.svg
│   └── og-image.jpg    # 공유용 이미지 (1200×630)
└── README.md
```

## 1. 로컬에서 보기

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

`index.html`을 더블클릭해서 열어도 대부분 동작합니다.

## 2. Google Forms 연결 (사전 신청)

모든 CTA 버튼(헤더·Hero·프로젝트 섹션·최종 CTA)은 **`js/config.js`의 한 줄**로 연결됩니다.

```js
GOOGLE_FORM_URL: "https://docs.google.com/forms/d/e/<폼ID>/viewform",
```

- 값이 **비어 있으면** 버튼을 눌렀을 때 "사전 신청을 준비하고 있어요" 안내창이 뜨고, 최종 CTA 아래에도 "준비 중" 문구가 표시됩니다. 임의의 URL은 만들지 않습니다.
- `https://docs.google.com/forms/...` 또는 `https://forms.gle/...` 형식이 아니면 경고를 출력하고 "준비 중" 상태를 유지합니다.
- 연결되면 버튼은 새 탭으로 폼을 엽니다(`rel="noopener noreferrer"`).

### 권장 폼 구성

| 항목 | 유형 | 필수 |
|---|---|---|
| 이메일 주소 | 이메일 수집(또는 단답형 + 이메일 검증) | ✅ |
| 자녀 연령대 | 객관식: 0~3세 / 4~7세 / 8~12세 / 12세 이후 | 선택 |
| 가장 기대하는 기능 | 객관식(또는 체크박스): 1개월 미니 챕터 / 3개월 디지털 이야기집 / 1년 디지털 기록집 / 1년 실물 하드커버 / 사진 기록 / 음성 녹음 | 선택 |
| 개인정보 수집 및 출시 알림 동의 | 체크박스 1개 | ✅ |

- **아이의 이름, 정확한 생년월일, 사진, 음성 파일은 묻지 마세요.** 초기에는 수집하지 않는다고 페이지에서 안내하고 있습니다.
- "가장 기대하는 기능" 항목이 두 서비스(Hello_Archive / Hello Archive jr)의 지불 의향을 비교하는 핵심 데이터입니다.

### 폼에 반드시 안내할 내용 (운영자 설정 필요)

Google Forms 설명란이나 동의 항목 위에 아래를 적어 주세요. (법률 검토는 운영자 책임입니다.)

- 수집 항목(이메일, 자녀 연령대, 기대 기능)과 **수집·이용 목적**(출시 알림 발송, 수요 조사)
- **보유 기간**(예: 출시 알림 발송 완료 또는 철회 요청 시까지)
- 동의를 거부할 권리와 거부 시 불이익(출시 알림을 받을 수 없음)
- **운영자 정보**와 문의처, 수신 거부·삭제 요청 방법
- 응답 데이터 접근 권한(Google 계정 공유 설정) 최소화

푸터에 운영자·문의처·개인정보 안내 링크를 보이려면 `config.js`의 `OPERATOR_NAME`, `CONTACT_EMAIL`, `PRIVACY_POLICY_URL`을 채우세요(비우면 표시하지 않음).

### (선택) 유입 채널을 응답에 함께 저장
1. 폼에 "유입 경로" **단답형** 항목을 추가하고, 항목 메뉴 → *미리 채워진 링크 가져오기*로 `entry.숫자`를 확인합니다.
2. `FORM_SOURCE_FIELD: "entry.숫자"`를 입력하면 `utm_source / utm_medium` 값이 폼 링크에 자동으로 채워집니다. (`docs.google.com` 전체 주소에서만 동작, 없으면 `direct`)

> 연결 후 **실제 제출 테스트**를 꼭 해 보세요. 응답이 시트에 기록되는지, 필수 항목이 막히는지 확인해야 합니다. 이 프로젝트에서는 아직 테스트하지 않았습니다.

## 3. 분석(GA4)과 성과 측정

`GA4_MEASUREMENT_ID: "G-XXXXXXXXXX"`를 넣으면 gtag이 로드됩니다. **비어 있으면 스크립트도, 이벤트도 없습니다.** 가짜 데이터는 만들지 않습니다.

| 지표 | 이벤트 | 비고 |
|---|---|---|
| 페이지 방문 | `page_view` | GA4 자동 수집 |
| Hero CTA 클릭 | `hero_cta_click` | |
| 성장 프로젝트 섹션 관심 | `growth_projects_view`(섹션 35% 노출), `growth_project_select`(`project`=`1m`/`3m`/`1y`) | 어떤 결과물에 관심이 큰지 비교 가능 |
| 최종 CTA 클릭 | `final_cta_click` | |
| 구글폼 이동 클릭 | `form_link_click` (`cta_location`) | 폼이 연결된 상태에서만 발생 |
| 기타 | `cta_click`(헤더·프로젝트 CTA), `book_page_view` | |

모든 이벤트에 `site_variant`(기본 `hello_archive_jr`)가 붙습니다. GA4 관리 → 맞춤 정의에서 이벤트 범위 측정기준 `site_variant`, `cta_location`, `project`를 등록하면 보고서에서 쓸 수 있습니다.

> ⚠️ **`form_link_click`은 신청 완료가 아닙니다.** 링크를 누른 횟수일 뿐입니다. **실제 신청 수는 Google Forms 응답 수**로만 집계하세요.
> GA4를 켜면 쿠키/식별자가 사용되므로, 운영 지역 규정에 따라 동의 배너·개인정보 안내가 필요할 수 있습니다.

### UTM 규칙
유입 링크에 `?utm_source=…&utm_medium=…&utm_campaign=…`을 붙이면 GA4가 자동 기록합니다.
예) `https://<도메인>/<저장소>/?utm_source=instagram&utm_medium=paid&utm_campaign=ab_2026q4&utm_content=archive_jr`

### Hello_Archive와 동일 기준으로 비교하기
두 서비스를 같은 정의로 비교하려면 다음을 맞춰 주세요. (기존 사이트에는 이 작업을 하지 않았습니다. 별도로 반영이 필요합니다.)

1. 같은 GA4 속성을 쓰고 `site_variant`로 구분(`hello_archive` / `hello_archive_jr`) — 또는 속성을 나누고 동일 이벤트명 사용
2. **방문자**: GA4 활성 사용자 수 (같은 기간·같은 유입 채널로 필터)
3. **CTA 클릭률** = `hero_cta_click`+`final_cta_click` 발생 사용자 ÷ 방문자
4. **폼 이동률** = `form_link_click` 사용자 ÷ 방문자
5. **신청 전환율** = Google Forms 응답 수 ÷ 방문자 *(수동 집계, 서비스별 폼을 따로 만들면 편해요)*
6. **기대 상품 분포** = 폼의 "가장 기대하는 기능" 응답 집계
7. 같은 기간, 비슷한 규모의 유입, 동일한 UTM 규칙으로 노출하세요.

## 4. GitHub Pages 배포

> 아직 아무것도 push하지 않았습니다. 아래는 승인 후 진행할 절차입니다.

1. 이 폴더를 **새 저장소**(예: `hello-archive-jr-landing`)로 만듭니다. 기존 Hello_Archive 저장소를 재사용하지 마세요.
   ```bash
   git init && git add . && git commit -m "Initial landing page"
   git branch -M main
   git remote add origin https://github.com/<계정>/hello-archive-jr-landing.git
   git push -u origin main
   ```
2. GitHub → *Settings → Pages → Build and deployment* → Source: `Deploy from a branch`, Branch: `main` / `/ (root)`.
3. 몇 분 뒤 `https://<계정>.github.io/hello-archive-jr-landing/`에서 확인합니다.

모든 경로가 **상대 경로**라 저장소 하위 경로에서도 동작합니다.

## 5. 출시 전 체크리스트

- [ ] `GOOGLE_FORM_URL` 입력 + 실제 제출/응답 기록 테스트
- [ ] 폼에 수집 목적·보유 기간·운영자 정보·동의 문구 작성
- [ ] 배포 주소 확정 후 `index.html`의 `og:image`, `twitter:image`를 **절대 URL**로 교체하고 `og:url`, `<link rel="canonical">` 추가 (SNS 미리보기는 상대 경로를 읽지 못합니다)
- [ ] `GA4_MEASUREMENT_ID` 입력 및 DebugView로 이벤트 확인, 필요 시 동의 배너 추가
- [ ] 푸터 운영자·문의처 입력
- [ ] 실제 모바일 기기(iOS Safari / Android Chrome)에서 터치·플립북 확인
- [ ] 가격·출시일·실물 책 사양은 **확정 전까지 페이지에 쓰지 않기** (현재 모두 "준비 중"으로 안내)
- [ ] Google Fonts 외부 요청이 문제라면 폰트를 자체 호스팅

## 6. 커스터마이징

- **색상**: `css/style.css` 맨 위 `:root`의 `--brand`(플럼), `--accent`(골드), `--ivory`, `--cream`, `--charcoal` 등을 바꾸면 전체가 바뀝니다.
- **문구/FAQ**: `index.html`에서 직접 수정합니다.
- **브랜드명**: 브랜드명은 `Hello Archive jr`입니다. 바꾸려면 `index.html`(title/meta/헤더/푸터)과 OG 이미지를 수정하세요.
- 페이지 속 책·아이·사진 자리는 모두 **가상의 예시**이며(자체 제작 SVG/CSS), 외부 이미지는 사용하지 않았습니다.

## 접근성·성능 메모

- 시맨틱 랜드마크, 건너뛰기 링크, 키보드로 조작 가능한 탭(←→/Home/End)·아코디언·플립북(←→)
- `prefers-reduced-motion` 시 애니메이션·자동 재생을 끕니다.
- JS가 꺼져도 본문과 FAQ가 모두 보입니다(탭 패널은 전부 펼침).
- 이미지는 CSS/SVG 위주이며, 외부 요청은 Google Fonts(+GA4 설정 시 gtag)뿐입니다.
