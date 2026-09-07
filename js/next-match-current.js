// ATSV Fanseite – aktuelles nächstes Spiel
(function(){
  const MATCH_DATE = new Date("2026-09-13T15:00:00");
  const HOME = "SV Buckenhofen II";
  const AWAY = "ATSV Forchheim";

  function update(){
    const box=document.querySelector(".next-match");
    if(!box)return;
    const dateEl=box.querySelector(".next-match-date");
    const teamsEl=box.querySelector(".next-match-teams");
    const countdown=box.querySelector(".countdown");
    const liveMessage=box.querySelector("#live-message");
    const difference=MATCH_DATE-new Date();
    if(dateEl)dateEl.textContent="Sonntag, 13.09.2026 · 15:00 Uhr";
    if(teamsEl)teamsEl.innerHTML=HOME+"<span>VS.</span>"+AWAY;
    if(difference<=0){
      if(countdown)countdown.style.display="none";
      if(liveMessage)liveMessage.innerHTML='<div class="game-live">🔴 SPIELTAG</div>';
      return;
    }
    if(countdown)countdown.style.display="grid";
    if(liveMessage)liveMessage.innerHTML="";
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value).padStart(2,"0")};
    set("days",Math.floor(difference/86400000));
    set("hours",Math.floor((difference/3600000)%24));
    set("minutes",Math.floor((difference/60000)%60));
    set("seconds",Math.floor((difference/1000)%60));
  }

  function protect(){
    const box=document.querySelector(".next-match");
    if(!box)return;
    const dateEl=box.querySelector(".next-match-date");
    const teamsEl=box.querySelector(".next-match-teams");
    if(dateEl&&dateEl.textContent!=="Sonntag, 13.09.2026 · 15:00 Uhr")update();
    else if(teamsEl&&teamsEl.textContent.replace(/\s+/g," ").trim()!=="SV Buckenhofen II VS. ATSV Forchheim")update();
  }

  function init(){
    update();
    setInterval(update,1000);
    const box=document.querySelector(".next-match");
    if(box)new MutationObserver(protect).observe(box,{subtree:true,childList:true,characterData:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
