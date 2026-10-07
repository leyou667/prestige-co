/**
 * Script inline (dans <head>) : l'accueil s'ouvre toujours en haut de page.
 *
 * Cause corrigée : au rechargement (ou à la réouverture d'un onglet), le navigateur restaure
 * l'ancienne position de défilement (history.scrollRestoration = "auto").
 *
 * Portée volontairement limitée :
 * - uniquement « / » sans ancre (un lien vers /#conseiller garde son comportement) ;
 * - jamais sur un retour / avance du navigateur (navigation « back_forward ») ;
 * - la restauration automatique est rétablie après le chargement, pour que le bouton retour
 *   continue de ramener à la bonne position ;
 * - si l'utilisateur fait défiler pendant le chargement, on ne le ramène pas en haut.
 */
export const homeScrollTopBootScript = `(function(){try{
if(location.pathname!=="/"||location.hash||!("scrollRestoration" in history))return;
var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
if(n&&n.type==="back_forward")return;
history.scrollRestoration="manual";
var moved=false,mark=function(){moved=true};
["wheel","touchstart","keydown"].forEach(function(e){addEventListener(e,mark,{once:true,passive:true})});
var top=function(){if(!moved)window.scrollTo({top:0,left:0,behavior:"instant"})};
top();
addEventListener("load",function(){top();setTimeout(function(){history.scrollRestoration="auto"},0)},{once:true});
}catch(e){}})();`;
