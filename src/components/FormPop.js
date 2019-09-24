import React from 'react'
import { Header, Button, Popup, Grid, Icon} from 'semantic-ui-react'
import styled from 'styled-components'


const StyledPop = styled.div`
 padding: 10px;
`

const NestedPop = styled.div`
`

const FormPop = () => (
    <Popup pinned={true}  trigger={<Button><Icon name='hand spock'></Icon></Button>} flowing on='click'>
        <Popup.Content>
    <StyledPop>
        <Popup
        flowing hoverable
          trigger={<div>Add to Playlist <Icon name='chevron right'></Icon></div>}
          position='top center'
          size='large'
          inverted
          >  
          <Popup.Content>Playlist playlist playlist</Popup.Content>
          </Popup> 
    </StyledPop>
    <StyledPop>
          <div>Go to Spotify Artist <Icon name='chevron right'></Icon></div>
    </StyledPop>
          </Popup.Content>
     
    </Popup>
  )

  export default FormPop

 