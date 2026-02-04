let currentDate = new Date();
let selectedDate = null;
let diaries = JSON.parse(localStorage.getItem("diaries") || "{}");

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function renderCalendar(){
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  document.getElementById("monthLabel").textContent = `${year} / ${month+1}`;

  let cal = document.getElementById("calendar");
  cal.innerHTML = "";

  // 曜日
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  weekdays.forEach(day=>{
    let div = document.createElement("div");
    div.textContent = day;
    div.className="weekday";
    cal.appendChild(div);
  });

  let firstDay = new Date(year,month,1).getDay();
  let lastDate = new Date(year,month+1,0).getDate();

  // 空白
  for(let i=0;i<firstDay;i++){ cal.appendChild(document.createElement("div")); }

  // 日付
  for(let d=1; d<=lastDate; d++){
    let key = `${year}-${month+1}-${d}`;
    let emo = diaries[key]?.emotion || "";
    let div = document.createElement("div");
    div.className="day " + emo;
    div.textContent = d;
    div.onclick = ()=> openDiary(key);
    cal.appendChild(div);
  }
}

function changeMonth(n){
  currentDate.setMonth(currentDate.getMonth()+n);
  renderCalendar();
}

function openDiary(dateKey){
  selectedDate=dateKey;
  showScreen("diaryScreen");
  document.getElementById("diaryDate").textContent = dateKey;
  let data = diaries[dateKey] || {};
  document.getElementById("diaryText").value = data.text || "";
  document.getElementById("emotion").value = data.emotion || "";
  updateCounter();
}

function updateCounter(){
  let text=document.getElementById("diaryText").value;
  let count=text.length;
  document.getElementById("counter").textContent=`${count} / 50`;
  if(count>=50){ document.getElementById("diaryText").classList.add("goal"); }
  else{ document.getElementById("diaryText").classList.remove("goal"); }
}
document.getElementById("diaryText").addEventListener("input",updateCounter);

function containsJapanese(str){ return /[ぁ-んァ-ン一-龯]/.test(str); }

function saveDiary(){
  let text=document.getElementById("diaryText").value;
  if(containsJapanese(text)){ alert("English only!"); return; }
  let emo=document.getElementById("emotion").value;
  diaries[selectedDate]={text:text, emotion:emo};
  localStorage.setItem("diaries",JSON.stringify(diaries));
  backCalendar();
  renderCalendar();
}

function backCalendar(){ showScreen("calendarScreen"); }

function openAnalyze(){
  showScreen("analyzeScreen");
  buildDictionary();
}

function buildDictionary(){
  let dict={};
  for(let date in diaries){
    let words=diaries[date].text.toLowerCase().match(/[a-z]+/g);
    if(!words) continue;
    words.forEach(w=>{ if(!dict[w]) dict[w]=[]; dict[w].push(date); });
  }

  let container=document.getElementById("dictionary");
  container.innerHTML="";

  let grouped={};
  Object.keys(dict).sort().forEach(word=>{
    let letter=word[0].toUpperCase();
    if(!grouped[letter]) grouped[letter]=[];
    grouped[letter].push(word);
  });

  for(let letter in grouped){
    let letterDiv=document.createElement("div");
    letterDiv.className="letter";
    letterDiv.textContent=letter;
    container.appendChild(letterDiv);

    grouped[letter].forEach(word=>{
      let wordDiv=document.createElement("div");
      wordDiv.className="word";
      let count=dict[word].length;
      wordDiv.textContent=`${word} (${count})`;

      let datesDiv=document.createElement("div");
      datesDiv.className="dates";
      dict[word].forEach(d=>{
        let btn=document.createElement("button");
        btn.textContent=d;
        btn.onclick=()=>openDiary(d);
        datesDiv.appendChild(btn);
      });
      wordDiv.appendChild(datesDiv);

      wordDiv.onclick=(e)=>{
        e.stopPropagation();
        let isVisible=datesDiv.style.display==="block";
        document.querySelectorAll(".dates").forEach(dv=>dv.style.display="none");
        datesDiv.style.display=isVisible?"none":"block";
      }

      container.appendChild(wordDiv);
    });
  }
}

document.getElementById("prevMonth").onclick=()=>changeMonth(-1);
document.getElementById("nextMonth").onclick=()=>changeMonth(1);
document.getElementById("saveBtn").onclick=saveDiary;
document.getElementById("backBtn").onclick=()=>showScreen("calendarScreen");
document.getElementById("analyzeBtn").onclick=openAnalyze;
document.getElementById("backAnalyzeBtn").onclick=()=>showScreen("calendarScreen");

renderCalendar();
