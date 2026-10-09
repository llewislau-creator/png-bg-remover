// Curated PIXORA typography references. These are article references, not bundled fonts.
// Licensing, redistribution, web embedding and individual font names require verification.
export const typographySources = [
  ['手寫 / Handwriting','14 款手寫字體','https://out-of-design.com/index.php/2024/10/17/14-handwritingfont/'],
  ['復古 / Vintage','7 款打字機／復古字體','https://out-of-design.com/index.php/2024/11/04/7-free-commercial-typewriter-font-recommendations/'],
  ['英文花體 / Script','9 款 Script 字體','https://out-of-design.com/index.php/2023/08/24/9-free-script-font/'],
  ['綜合 / Creative','7 款免費字體合集','https://out-of-design.com/index.php/2023/08/08/7-free-fonts-set/'],
  ['東方書法 / Calligraphy','中文書法字體','https://out-of-design.com/index.php/2023/07/17/chinese-calligraphy-font/'],
  ['童趣 / Crayon','蠟筆字體','https://out-of-design.com/index.php/2023/06/27/free-crayon-font/']
];
export function setupTypographyReferences(panel){
  const select=panel.querySelector('#fs-font');
  if(!select || panel.querySelector('.fs-type-resources')) return;
  const details=document.createElement('details');
  details.className='fs-type-resources';
  const summary=document.createElement('summary');
  summary.textContent='探索更多字體 · 6 組參考來源';
  const intro=document.createElement('p');
  intro.textContent='以下為字體設計參考，並非已安裝字體。請先確認原作者的商用、網頁嵌入及再散布授權；取得合法字體檔後，可使用上方「匯入字體」即時預覽與輸出。';
  details.append(summary,intro);
  const list=document.createElement('ul');
  for(const [category,title,url] of typographySources){
    const item=document.createElement('li'),link=document.createElement('a');
    link.href=url;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent=category+' — '+title+' ↗';
    item.append(link);list.append(item);
  }
  details.append(list);
  const fileInput=panel.querySelector('#fs-font-file');
  fileInput?.closest('label')?.after(details);
  if(!details.isConnected) select.after(details);
}
