// Вкладка креатива с тремя томами. EMI их не показывает (diary_hide.js).
// RecipeViewerEvents.removeEntries прячет только просмотр рецептов;
// modifyCreativeTab.remove не вызываем — иначе уйдёт и креатив
// (KubeJS #1096: Completely + tab.remove = пропадёт из обоих).
StartupEvents.registry('creative_mode_tab', event => {
  event.create('asi_diaries')
    .icon(() => Item.of('modopedia:book[modopedia:book="asi:mechanist_diary"]'))
    .displayName('Founders\' diaries')
    .content(() => [
      Item.of('modopedia:book[modopedia:book="asi:mechanist_diary"]'),
      Item.of('modopedia:book[modopedia:book="asi:skyward_diary"]'),
      Item.of('modopedia:book[modopedia:book="asi:wildlander_diary"]')
    ])
})
