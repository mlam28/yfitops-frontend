import React from 'react'
import { Card, Icon, Image } from 'semantic-ui-react'
import {connect} from 'react-redux'
import {setPlaylistPage, fetchPlaylistTracks, setCurrentTracks, setQueueTracks, playMusic, pauseMusic, fetchPlaylistMembers} from '../redux/userActions'
import {withRouter} from 'react-router-dom'
import {copying, clearPUsers} from '../redux/userActions'


const PlaylistCard = ({currentUser, playlist, setPlaylistPage, fetchPlaylistTracks, history, setCurrentTracks, setQueueTracks, playMusic, pauseMusic, copying, clearPUsers, fetchPlaylistMembers}) => {
    
   const handlePlaylistClick = () => {
       setPlaylistPage(playlist.name)
        
       if (playlist.songs){
           copying(playlist.id)
           fetchPlaylistMembers()
           history.push('/shared/' + playlist.name + '#' + playlist.playlist_uri)
           setQueueTracks(playlist.songs)
        } else {
            history.push('/playlist/' + playlist.name)
            fetchPlaylistTracks(currentUser.token, playlist.id)
            clearPUsers()
       }
    }
    
    const handlePlayButtonClick = (e, playlist) => {
        console.log('clicked')
        if (playlist.songs){
            setCurrentTracks(playlist.songs)
            pauseMusic()
            playMusic()
        } else {
            setCurrentTracks([playlist])
            pauseMusic()
            playMusic()
        }
    }

    return(
        <Card color='grey' className='playlist-card' >
            <Image height='280 !important' width='280 !important' className='card-image' onClick={handlePlaylistClick} src={playlist.images.length > 0 && playlist.images[0].url !== '' ? playlist.images[0].url : 'https://data.whicdn.com/images/292360124/original.jpg'} wrapped ui={false} />
            <Card.Content>
                <Card.Header>{playlist.name}</Card.Header>
              <img onClick={(e) => handlePlayButtonClick(e, playlist)}src={require('../images/icons8-circled-play-50.png')}></img>
             
            </Card.Content>
  </Card>
    )
}

const mapStateToProps = (store) => {
    return {
        currentUser: store.currentUser
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        setPlaylistPage: (name) => dispatch(setPlaylistPage(name)),
        fetchPlaylistTracks: (token, playlistId) => dispatch(fetchPlaylistTracks(token, playlistId)),
        setCurrentTracks: (tracks) => dispatch(setCurrentTracks(tracks)),
        setQueueTracks: (tracks) => dispatch(setQueueTracks(tracks)),
        playMusic: () => dispatch(playMusic()),
        pauseMusic: () => dispatch(pauseMusic()),
        copying: (playlistId) => dispatch(copying(playlistId)),
        clearPUsers: () => dispatch(clearPUsers()),
        fetchPlaylistMembers: () => dispatch(fetchPlaylistMembers())
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaylistCard))