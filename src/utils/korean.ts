/** 한글 받침 여부에 따라 조사를 선택한다. josa("도현", "은", "는") → "은" */
export function josa(word: string, withBatchim: string, without: string): string {
  const ch = word.charCodeAt(word.length - 1);
  if (ch >= 0xac00 && ch <= 0xd7a3) {
    return (ch - 0xac00) % 28 > 0 ? withBatchim : without;
  }
  return without;
}

/** 관계를 자연어 문장으로 변환한다. */
export function relationSentence(
  source: string,
  type: string,
  target: string
): string {
  const eunNeun = josa(source, "은", "는");
  const waGwa = josa(target, "과", "와");
  switch (type) {
    case "소속":
      return `${source}${eunNeun} ${target}에 속해 있다.`;
    case "가족":
      return `${source}${eunNeun} ${target}${waGwa} 가족이다.`;
    case "형제":
      return `${source}${eunNeun} ${target}${waGwa} 형제이다.`;
    case "적대":
      return `${source}${eunNeun} ${target}${waGwa} 사이가 나쁘다.`;
    case "은인":
      return `${source}에게 ${target}${eunNeun} 은인이다.`;
    case "조력자":
      return `${source}${eunNeun} ${target}${josa(target, "을", "를")} 도와준다.`;
    case "소유자":
      return `${source}의 주인은 ${target}이다.`;
    case "거점":
      return `${source}${eunNeun} ${target}에 산다.`;
    case "장소":
      return `${source}${eunNeun} ${target}에서 일어난다.`;
    case "적용대상":
      return `${source}${eunNeun} ${target}에게 적용된다.`;
    case "사용조건":
      return `${source}의 조건은 '${target}'이다.`;
    case "위반결과":
      return `${source}${josa(source, "을", "를")} 어기면 '${target}'이 따른다.`;
    case "응징":
      return `${source}${eunNeun} ${target}${josa(target, "을", "를")} 응징한다.`;
    case "배신":
      return `${source}${eunNeun} ${target}${josa(target, "을", "를")} 배신했다.`;
    case "약속":
      return `${source}${eunNeun} ${target}${waGwa} 약속을 맺었다.`;
    case "원인":
      return `${source}${eunNeun} ${target}의 원인이다.`;
    case "결과":
      return `${source}${eunNeun} ${target}의 결과이다.`;
    case "관련사건":
    case "관련 사건":
      return `${source}${eunNeun} ${target}${waGwa} 이어진 사건이다.`;
    default:
      return `${source}${eunNeun} ${target}${waGwa} '${type}' 관계이다.`;
  }
}
