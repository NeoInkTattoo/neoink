/* Neo Ink analytics consent: no Yandex request is made before acceptance. */
(function(){
  "use strict";
  var key="neoink_analytics_consent_v1", counterId=114027057;
  function storedChoice(){try{return localStorage.getItem(key)}catch(e){return null}}
  function saveChoice(value){try{localStorage.setItem(key,value)}catch(e){ /* storage disabled */ }}
  function startMetrika(){
    if(window.__neoMetrikaLoaded)return;
    window.__neoMetrikaLoaded=true;
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}
      k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
    })(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id="+counterId,"ym");
    ym(counterId,"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
  }
  function render(){
    var choice=storedChoice();
    if(choice==="accepted"){startMetrika();return}
    if(choice==="rejected")return;
    var banner=document.createElement("section");
    banner.className="neo-cookie";banner.setAttribute("role","region");banner.setAttribute("aria-label","Настройки аналитических cookies");
    banner.innerHTML='<div class="neo-cookie-content"><p class="neo-cookie-title">Мы используем cookies</p><p class="neo-cookie-copy">С вашего разрешения Яндекс Метрика поможет нам понять, как посетители пользуются сайтом. Можно отказаться. Подробнее в <a href="/privacy.html">политике конфиденциальности</a>.</p></div><div class="neo-cookie-actions"><button type="button" data-cookie-choice="reject">Отклонить</button><button type="button" data-cookie-choice="accept">Принять</button></div>';
    banner.addEventListener("click",function(event){
      var button=event.target.closest("button[data-cookie-choice]");if(!button)return;
      var accepted=button.getAttribute("data-cookie-choice")==="accept";
      saveChoice(accepted?"accepted":"rejected");
      banner.remove();
      if(accepted)startMetrika();
    });
    document.body.appendChild(banner);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
})();
