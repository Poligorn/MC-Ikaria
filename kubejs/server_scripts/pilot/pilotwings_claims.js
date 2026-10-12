// Клеймы по рангу лицензии. var, не const: общая область server_scripts + /reload.
ServerEvents.recipes(event => {
  event.remove({ output: 'aeroclaims:claim_block' })
})

var CLAIMS_BY_RANK = {
  cadet: 5
}

function grantClaims(player, rank) {
  var amount = CLAIMS_BY_RANK[rank]
  if (!amount) {
    console.warn('[PilotWings] Неизвестный ранг: ' + rank)
    return
  }
  player.give(Item.of('aeroclaims:claim_block', amount))
  player.tell(Text.green('Начислено ' + amount + ' клейм-блоков (ранг: ' + rank + ')'))
}
