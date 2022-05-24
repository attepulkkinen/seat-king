const {Modal, Blocks, Elements, Bits, setIfTruthy} = require('slack-block-builder');

module.exports = async (groups, selectedGroup, selectedGroupMembers) => Modal()
  .title('Edit Groups')
  .callbackId('edit_teams_submit')
  .blocks(
    Blocks.Section({text: 'Hello! Need to edit some groups?'}),
    Blocks.Input({label: 'Select a group to get started'})
      .dispatchAction()
      .element(
        Elements.StaticSelect({placeholder: 'Select a group...'})
          .actionId('edit_teams_select_team')
          .initialOption(setIfTruthy(
            selectedGroup,
            groups.filter(({id}) => id === selectedGroup)
              .map(({name, id}) => Bits.Option({text: name, value: id}))[0]
          ))
          .options(groups.map(({name, id}) => Bits.Option({text: name, value: id})))),
    setIfTruthy(selectedGroup, [
      Blocks.Input({label: 'Current group members'})
        .element(
          Elements.UserMultiSelect({placeholder: 'Select members...'})
            .actionId('edit_teams_select_members')
            .initialUsers(selectedGroupMembers))
    ]))
  .submit(setIfTruthy(selectedGroup, 'Save Changes'))
  .buildToJSON();
