import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import context from '../component/Context';
import mnd from '../assets/logo.svg';

const App = (props) => {
  const state = useContext(context);
  const { setUser, setYear } = state;
  const [view, setView] = useState(false);
  const [inputs, setInputs] = useState({
    number: "",
    pw: "",
  });
  const { number, pw } = inputs;
  const history = useHistory();

  // 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedYear = JSON.parse(localStorage.getItem('year'));

    if (storedUser && storedYear) {
      setUser(storedUser);
      setYear(storedYear);
    }
  }, [setUser, setYear]);

  // 입력 변경 핸들러
  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value || "",
    }));
  };

  // 로그인 체크
  const onCheck = async () => {
    if (!number || !pw) return; // 입력값이 없으면 아무 작업도 하지 않음

    const docRef = doc(props.manage, "ini");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (
        (number === data.adminID && pw === data.adminPW) ||
        (number === data.rootID && pw === data.rootPW)
      ) {
        setUser(number);
        setYear(data.year);

        localStorage.setItem('user', number);
        localStorage.setItem("year", JSON.stringify(data.year));

        if (number === data.adminID) {
          await setDoc(doc(props.manage, "ini"), {
            log: {
              ['GT_' + new Date().getTime()]: serverTimestamp() // 고유한 필드명으로 데이터 추가
            }
          }, { merge: true });
        }

        history.push('/');
      } else {
        setInputs({
          number: '',
          pw: ''
        });
      }
    } else {
      console.log("No such document!");
    }
  };

  return (
    <div className='container'>
      <div className='login'>
        <div className='visual'>
          <div className='visualText'>
            <div className='textGroup'>
              <span>체</span><span>크</span><span>리</span><span>스</span>
              <span>대</span><span>장</span>
            </div>
            <img className='visualLogo' src={mnd} alt={'logo'} />
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); }}>
          <div className='armyWrap'>
            <div className={'input'}>
              <input
                className={'id'}
                type="text"
                id='number'
                name="number"
                maxLength={16}
                placeholder="아이디"
                onChange={onChange}
                value={number}
              />
            </div>
            <div className={'input'}>
              <input
                className={'pw'}
                type={view ? 'text' : 'password'}
                id='pw'
                name="pw"
                maxLength={16}
                placeholder="비밀번호"
                onChange={onChange}
                autoComplete="off"
                value={pw}
              />
              <button
                className='passView'
                type="button"
                onClick={() => setView(!view)}
                title="pass view"
              >
                <i className={view ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
              <span className={'vali'}>
                {number === "" && pw === ""
                  ? '아이디와 비밀번호는 관리자에게 문의하세요'
                  : number === 'fail'
                    ? '올바른 아이디가 아닙니다'
                    : pw === 'fail'
                      ? '비밀번호를 입력하세요'
                      : pw === 'same'
                        ? '비밀번호가 일치하지 않습니다'
                        : ''}
              </span>
            </div>
          </div>
          <div className='controll'>
            <div className='buttonContainer'>
              <button
                className={'button sign'}
                type="button"
                onClick={onCheck}
                disabled={!number || !pw} // 아이디나 비밀번호가 비어있으면 비활성화
              >
                확인
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;