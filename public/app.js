"use strict";
const $=id=>document.getElementById(id);
const store=(key,fallback)=>{try{return localStorage.getItem(key)||fallback}catch{return fallback}};
let course=null,weekIndex=0,lang=store("bhim-lang","en"),theme=store("bhim-theme","notebook"),collapsed=false;
let done={};try{done=JSON.parse(store("bhim-done","{}"))||{}}catch{done={}}
const words={
 en:{brandCaption:"STUDY NOTEBOOK",yourCourse:"YOUR COURSE",courseHeading:"Health<br>Informatics",courseSub:"8 learning chapters · based on original lecture decks",chapters:"CHAPTERS",progress:"Your reading progress",sourceNote:"Study cards preserve content from the original lecture slides.",courseSmall:"COURSE",style:"STYLE",language:"LANGUAGE",week:"WEEK",lessons:"SOURCE-BASED STUDY CARDS",continue:"Continue reading",savePdf:"Save week as PDF",glance:"AT A GLANCE",yourGuide:"Your study guide",studyCards:"Study cards",theLesson:"THE LESSON",readReflect:"Read, reflect, understand.",companion:"STUDY COMPANION",makeStick:"Make it stick.",companionDesc:"Mark cards as read to track your progress. Your progress stays in this browser.",topics:"Topics in this week",sourceTitle:"Grounded in the lectures",sourceDesc:"Each card identifies its page in the original lecture. Print this week to save a PDF copy of your notes.",previous:"← PREVIOUS WEEK",next:"NEXT WEEK →",footer:"Health Informatics · Weeks 1–6, 8 and 9 · Educational reading notebook",search:"Search this week",collapse:"Collapse all",expand:"Expand all",sourcePage:"SOURCE PAGE",read:"Mark as read",readDone:"✓ Read",empty:"No matching study cards. Try another keyword.",arabicNotice:"",navAria:"Course weeks"},
 ar:{brandCaption:"دفتر المذاكرة",yourCourse:"مقررك",courseHeading:"المعلوماتية<br>الصحية",courseSub:"ثمانية أسابيع تعليمية · مستندة إلى المحاضرات",chapters:"الأسابيع",progress:"تقدم القراءة",sourceNote:"تحافظ البطاقات التعليمية على محتوى شرائح المحاضرات الأصلية.",courseSmall:"المقرر",style:"المظهر",language:"اللغة",week:"الأسبوع",lessons:"بطاقات تعليمية من المحاضرات",continue:"متابعة القراءة",savePdf:"حفظ الأسبوع بصيغة PDF",glance:"لمحة عامة",yourGuide:"دليلك للمذاكرة",studyCards:"بطاقات دراسية",theLesson:"الدرس",readReflect:"اقرأ، تأمل، واستوعب.",companion:"مرافق الدراسة",makeStick:"ثبّت تعلمك.",companionDesc:"علّم البطاقات كمقروءة لمتابعة تقدمك. يتم حفظ التقدم في هذا المتصفح.",topics:"موضوعات الأسبوع",sourceTitle:"مستند إلى المحاضرات",sourceDesc:"تعرض كل بطاقة رقم الصفحة من المحاضرة الأصلية. اطبع هذا الأسبوع لحفظ نسخة PDF.",previous:"← الأسبوع السابق",next:"الأسبوع التالي →",footer:"المعلوماتية الصحية · الأسابيع ١–٦ و٨ و٩ · دفتر الدراسة",search:"ابحث في هذا الأسبوع",collapse:"طي الكل",expand:"فتح الكل",sourcePage:"صفحة المصدر",read:"تحديد كمقروء",readDone:"✓ تمت القراءة",empty:"لا توجد نتائج مطابقة. جرّب كلمة أخرى.",arabicNotice:"تتوفر الواجهة وعناوين الأسابيع والملخصات باللغة العربية. يُعرض النص التعليمي الأصلي بالإنجليزية للمحافظة على الدقة؛ لم تتم ترجمة جميع البطاقات بعد.",navAria:"أسابيع المقرر"}
};
function safe(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function keep(){try{localStorage.setItem("bhim-done",JSON.stringify(done));localStorage.setItem("bhim-lang",lang);localStorage.setItem("bhim-theme",theme)}catch{}}
function completed(w,i){return done[w.week+"-"+i]===true}
function percentage(){let total=0,read=0;for(const w of course.weeks)for(let i=0;i<w.slides.length;i++){total++;if(completed(w,i))read++}return total?Math.round(read/total*100):0}
function setInterface(){
 const t=words[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";document.body.dataset.theme=theme;
 $("langSelect").value=lang;$("themeSelect").value=theme;
 document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(key==="courseHeading")el.innerHTML=t[key];else el.textContent=t[key]||""});
 $("search").placeholder=t.search;$("collapseBtn").textContent=collapsed?t.expand:t.collapse;
 $("languageNotice").hidden=lang!=="ar";$("languageNotice").textContent=t.arabicNotice;
 document.title="BHIM473 · "+(lang==="ar"?"المعلوماتية الصحية":"Health Informatics");
}
function makeNav(){
 const current=course.weeks[weekIndex];
 $("weekNav").innerHTML=course.weeks.map((w,i)=>{
 const count=w.slides.filter((s,n)=>completed(w,n)).length;
 return '<button type="button" class="weekItem '+(i===weekIndex?"active":"")+'" data-week="'+i+'" '+(i===weekIndex?'aria-current="page"':"")+'><span class="weekNum">'+String(w.week).padStart(2,"0")+'</span><span class="navName">'+safe(lang==="ar"?w.arTitle:w.title)+'</span>'+(count===w.slides.length?'<span class="tick">✓</span>':"")+'</button>';
 }).join("");
 document.querySelectorAll("[data-week]").forEach(b=>b.addEventListener("click",()=>selectWeek(Number(b.dataset.week))));
 const percent=percentage();$("percentDone").textContent=percent+"%";$("progressBar").style.width=percent+"%";
}
function renderCards(){
 const w=course.weeks[weekIndex],t=words[lang],q=$("search").value.trim().toLowerCase();
 let visible=0;
 const cards=w.slides.map((s,i)=>{
 const match=!q||[s.title,...s.points].join(" ").toLowerCase().includes(q);
 if(match)visible++;
 const key=w.week+"-"+i;
 return '<details class="lessonCard" data-card="'+i+'" '+(collapsed?"":"open")+' '+(match?"":"hidden")+'><summary><span class="number">'+String(i+1).padStart(2,"0")+'</span><h3 lang="en" dir="ltr">'+safe(s.title)+'</h3><span class="chevron" aria-hidden="true">⌄</span></summary><div class="lessonBody" lang="en" dir="ltr">'+(s.points.length?'<ul>'+s.points.map(p=>"<li>"+safe(p)+"</li>").join("")+"</ul>":"")+'<div class="cardFooter"><span class="sourcePage">'+t.sourcePage+" "+s.page+'</span><button type="button" class="checkDone '+(done[key]?"isDone":"")+'" data-done="'+i+'" aria-pressed="'+Boolean(done[key])+'">'+(done[key]?t.readDone:t.read)+'</button></div></div></details>';
 });
 $("lessonList").innerHTML=visible?cards.join(""):'<div class="empty">'+t.empty+"</div>";
 document.querySelectorAll("[data-done]").forEach(b=>b.addEventListener("click",e=>{
   e.preventDefault();const i=Number(b.dataset.done);const key=w.week+"-"+i;done[key]=!done[key];keep();
   b.classList.toggle("isDone",done[key]);b.textContent=done[key]?t.readDone:t.read;b.setAttribute("aria-pressed",String(Boolean(done[key])));makeNav();
 }));
}
function render(){
 const w=course.weeks[weekIndex],t=words[lang];setInterface();
 $("crumbWeek").textContent=t.week+" "+String(w.week).padStart(2,"0");
 $("weekTag").textContent=t.week+" "+String(w.week).padStart(2,"0");
 $("lessonCount").textContent=w.slides.length+" "+t.lessons;
 $("lessonTitle").textContent=lang==="ar"?w.arTitle:w.title;
 $("lessonDesc").textContent=lang==="ar"?w.arDescription:w.description;
 $("overviewDesc").textContent=lang==="ar"?w.arDescription:w.description;
 $("conceptCount").textContent=w.slides.length;
 $("topicList").innerHTML=w.slides.filter(x=>x.points.length).slice(0,7).map(s=>'<div class="topic" lang="en" dir="ltr">'+safe(s.title)+"</div>").join("");
 renderCards();makeNav();
 const prev=course.weeks[weekIndex-1],next=course.weeks[weekIndex+1];
 $("prevWeek").disabled=!prev;$("nextWeek").disabled=!next;
 $("prevWeekTitle").textContent=prev?(lang==="ar"?prev.arTitle:prev.title):"—";
 $("nextWeekTitle").textContent=next?(lang==="ar"?next.arTitle:next.title):"—";
}
function closeMenu(){$("sidebar").classList.remove("open");$("scrim").classList.remove("visible")}
function selectWeek(i){
 if(i<0||i>=course.weeks.length)return;
 weekIndex=i;$("search").value="";
 history.replaceState(null,"","#week-"+course.weeks[i].week);
 render();closeMenu();window.scrollTo({top:0,behavior:"smooth"});
}
function printWeek(){
 const cards=[...document.querySelectorAll(".lessonCard")];
 const was=cards.map(x=>x.open);
 cards.forEach(x=>x.open=true);
 window.print();
 window.addEventListener("afterprint",()=>cards.forEach((x,i)=>x.open=was[i]),{once:true});
}
async function init(){
 try{
 const r=await fetch("./course.json",{cache:"no-cache"});if(!r.ok)throw Error("Failed to load the course data");
 course=await r.json();
 if(!Array.isArray(course.weeks)||course.weeks.map(w=>w.week).join(",")!=="1,2,3,4,5,6,8,9")throw Error("Course weeks are invalid");
 const m=location.hash.match(/^#week-(\d+)$/);
 if(m){const index=course.weeks.findIndex(w=>w.week===Number(m[1]));if(index>=0)weekIndex=index}
 render();
 $("langSelect").addEventListener("change",e=>{lang=e.target.value;keep();render()});
 $("themeSelect").addEventListener("change",e=>{theme=e.target.value;keep();render()});
 $("search").addEventListener("input",renderCards);
 $("collapseBtn").addEventListener("click",()=>{collapsed=!collapsed;document.querySelectorAll(".lessonCard").forEach(card=>card.open=!collapsed);$("collapseBtn").textContent=collapsed?words[lang].expand:words[lang].collapse});
 $("startBtn").addEventListener("click",()=>$("studyArea").scrollIntoView({behavior:"smooth"}));
 $("printBtn").addEventListener("click",printWeek);
 $("printHeroBtn").addEventListener("click",printWeek);
 $("menuBtn").addEventListener("click",()=>{$("sidebar").classList.add("open");$("scrim").classList.add("visible")});
 $("scrim").addEventListener("click",closeMenu);
 $("prevWeek").addEventListener("click",()=>selectWeek(weekIndex-1));
 $("nextWeek").addEventListener("click",()=>selectWeek(weekIndex+1));
 window.addEventListener("hashchange",()=>{const m=location.hash.match(/^#week-(\d+)$/);if(m){const index=course.weeks.findIndex(w=>w.week===Number(m[1]));if(index>=0){weekIndex=index;render()}}});
 }catch(err){
 const el=document.querySelector(".pageContent");if(el)el.textContent="Unable to load the course. "+err.message;
 }
}
init();