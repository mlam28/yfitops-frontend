import SpotifyWebApi from 'spotify-web-api-js';
import {formatDuration} from './helpers.js'

const spotifyApi = new SpotifyWebApi()

function setUser (user) {
    return {type: 'LOGIN-USER', user: user}
}

function logoutUser () {
    return {type: 'LOGOUT-USER'}
}

function setToken (token){
    return {type: 'SET-TOKEN', token: token}
}

function setHome(){
    return {type: 'HOME-PAGE'}
}

function setPlaylistPage(name){
    return {type: 'PLAYLIST-PAGE', name: name}
}

function setBrowse(){
    return {type: 'BROWSE-PAGE'}
}

function setUserPlaylists(playlists){
    return {type: 'SET-USER-PLAYLISTS', playlists: playlists}
}


function formatPlaylists(playlistObj){
  return playlistObj.items.map(x => Object.assign({}, {'id': x.id, 'name': x.name, 'uri': x.uri, 'images': x.images, 'tracks': x.tracks}))
}
function fetchUserPlaylists(token){
    spotifyApi.setAccessToken(token)
    return function (dispatch) {
        spotifyApi.getUserPlaylists().then(playlists => dispatch(setUserPlaylists(formatPlaylists(playlists))))
    }
    
}


function setFeaturedPlaylists(playlists){
    return {type: 'SET-FEATURED', playlists: playlists}
}


function fetchFeaturedPlaylists(token){
    spotifyApi.setAccessToken(token)
    return function(dispatch) {
        spotifyApi.getFeaturedPlaylists().then(obj => {console.log(obj.playlists); dispatch(setFeaturedPlaylists(formatPlaylists(obj.playlists)))})
    }
}

function setCurrentTracks(tracks) {

    return {type: 'SET-TRACKS', tracks: tracks}
}

function fetchPlaylistTracks(token, playlistId){
    spotifyApi.setAccessToken(token)
    return function (dispatch){
        spotifyApi.getPlaylistTracks(playlistId).then(resp => {console.log(resp); const tracks = resp.items.map(item => { return Object.assign({}, {name: item.track ? item.track.name : '', artist: item.track ? item.track.artists[0].name : '', artist_uri: item.track ? item.track.artists[0].uri : '', uri: item.track ? item.track.uri : '', time: item.track ? formatDuration(item.track.duration_ms) : ''})})
        dispatch(setQueueTracks(tracks));
        
        })

    }
}

function setSharedPlaylists(playlists){
    return {type: 'SET-SHARED', playlists: playlists}
}


function fetchSharedPlaylists(userId){

    return function (dispatch) {
  
        fetch(`http://localhost:3000/users/${userId}`).then(resp => resp.json()).then(data => {console.log(data); dispatch(setSharedPlaylists(data))})
    }
    
}

// queue tracks are set in redux state every time user clicks on a specific playlist so that tracks are ready to play. 
function setQueueTracks(tracks){
    return {type: 'QUEUE-TRACKS', tracks: tracks}
}

function setPlayPosition(num){
    return {type: 'SET-POSITION', position: num}
}


function logoutUserFromStorage(){
    return function (dispatch) {
        window.localStorage.removeItem('user')
        dispatch(logoutUser())
    }
}

function playMusic(){
    return {type: 'PLAY'}
}

function pauseMusic(){
    return {type: 'PAUSE'}
}

// fetches to backend to create a new shared playlist
function makePlaylist(name, imageURL){

    return function(dispatch, getState){
       const userId = getState().currentUser.userId
       
    const data = {
        playlist: {name: name, image: imageURL, user_ids:[userId]}
    }
    const obj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }

    fetch(`http://localhost:3000/playlists`, obj).then(resp => resp.json()).then(data => {console.log(data); dispatch(addPlaylist(data))} )
}
}


function addPlaylist(playlist){
    return {type: 'ADD', playlist: playlist}
}

// fetch call to rails backend to add song to a shared playlist
function addSong(e, song, playlist_id){
    console.log('hello')

    return function(dispatch, getState){
        const data = {
            song_playlist: {name: song.name, uri: song.uri, time: song.time, artist_uri: song.artist_uri, playlist_id: playlist_id, artist: song.artist}
        }
        const obj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        fetch('http://localhost:3000/song_playlists', obj).then(resp => resp.json()).then(song => {console.log(song); 
        const copyId = getState().copying;
        if(copyId === song.playlist_id){

            dispatch(addSongToQueue(song.song))
        }

        dispatch(findPlaylistAddSong(song))})
    }
}

function addSongToQueue(song){
    return {type: 'ADD-SONG-QUEUE', song: song}
}





function findPlaylistAddSong(playlistSong) {
    return {
        type: 'ADD-SONG', id: playlistSong.playlist_id, song: playlistSong.song
    }
}

function addLike(song){
    return{type: 'ADD-LIKE', song: song}
}

function addLikeQueue(song){
    return {type: 'ADD-LIKE-QUEUE', song: song}
}

// fetch call to add a like to a song on a shared playlist
function fetchAddLike(e, song_id){

    return function(dispatch, getState){

        const userId = getState().currentUser.userId
        const data ={ 
            like: {song_playlist_id: song_id, user_id: userId}
        }
        const obj ={
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        fetch('http://localhost:3000/likes', obj).then(resp => resp.json()).then(song => {console.log(song); dispatch(addLike(song)); dispatch(addLikeQueue(song))})
    }
}

function fetchDislike(e, song_id){

    return function(dispatch, getState){

        const userId = getState().currentUser.userId
        const data ={ 
            like: {song_playlist_id: song_id, user_id: userId}
        }
        const obj ={
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        fetch('http://localhost:3000/dislikes', obj).then(resp => resp.json()).then(song => {console.log(song); dispatch(addLike(song)); dispatch(addDislike(song)); dispatch(addDisQueue(song))})
    }


}




function addDislike(song){
    return {type: 'ADD-LIKE', song: song}
}

function addDisQueue(song){
    return{type: 'ADD-DISLIKE-SONG', song: song}
}

// searches spotify upon enter of search bar
function spotifySearch(input){

    return function(dispatch, getState){
        let token = getState().currentUser.token
        let options = JSON.stringify({limit: 50})
        spotifyApi.setAccessToken(token)
        spotifyApi.searchTracks(input, options).then(resp => {console.log(resp); 
        let tracks = resp.tracks.items.map(item => {
          return  Object.assign({}, {image: item.album.images[2].url, name: item.name, artist: item.artists[0].name, artist_uri: item.artists[0].uri, uri: item.uri, time: formatDuration(item.duration_ms)})
        })

        // let albums = resp.albums.items.map(item => {
        //    return Object.assign({}, {
        //         name: item.name, image: item.images[2].url, artist: item.artists[0].name, artist_uri: item.artists[0].uri, album_uri: item.uri
        //     })
        // })
        dispatch(setNextUrl(resp.tracks.href))
        dispatch(setSearchTracks(tracks));
        // dispatch(setSearchAlbums(albums))
        
        } )
    }
}



// does not work, has cors issue, will come back later
function getMore(){
    return function(dispatch, getState){
        let token = getState().currentUser.token
        let obj = {
            method: 'GET',
            headers: {
                'Authorization': "Bearer" + token,
                'Content-Type': 'application/json'
            }
        }
       let url = 'https://api.spotify.com/v1/search?query=hello&type=track&market=US&offset=0&limit=20'

       fetch(url, obj).then(resp => console.log(resp))
    }
}


function setNextUrl(url){
    return {type: 'SET-URL', url: url}
}

function deleteSong(songPlaylistId){
    return function(dispatch, getState){
        let userId = getState().currentUser.id
        let data = {}
        let obj = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
           },
           
        }

        fetch(`http://localhost:3000/song_playlists/${songPlaylistId}`, obj).then(resp => resp.json()).then(data => {console.log(data); dispatch(deleteSongFromQueue(data)); dispatch(deleteSongFromPlaylist(data))})
    }
}

function deleteSongFromQueue(data){
    return {type: 'DELETE-SONG-QUEUE', songId: data.songId}
}

// sends action to remove song from sharedplaylist reducer after user deletes it from a shared platlist
function deleteSongFromPlaylist(data){
    return {type: 'DELETE-SONG-FROM-PLAYLIST', songId: data.songId, playlistId: data.playlistId}
}



// copies selected playlist down to spotify by fetching to rails backend--which then alters spotify
function downToSpotify(name){

    return function(dispatch, getState){
        let userId = getState().currentUser.userId
        let tracks = getState().queueTracks.map(track => track.uri)
        let playlistId = getState().copying
        let obj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId: userId, playlistId: playlistId, name: name, tracks: tracks})
        }
        fetch('http://localhost:3000/copytospotify', obj).then(resp => resp.json()).then(data => {console.log(data); 
        if(data.message){
            alert(data.message)
        }
    })
    }
}

function copying(playlistId){
    return {type: 'COPYING', playlistId: playlistId}
}


// updates playlist that is already copied down to spotify by fetching to rails backend--which then alters spotify
function updateToSpotify(){

    return function(dispatch, getState){
        let userId = getState().currentUser.userId
        let tracks = getState().queueTracks.map(track => track.uri)
        let playlistId = getState().copying
        debugger
        let obj = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId: userId, playlistId: playlistId,  tracks: tracks})
        }
        fetch('http://localhost:3000/updatespotify', obj).then(resp => resp.json()).then(data => {console.log(data); 
        if (data.message){
            alert(data.message)
        }
    })


    }
}


// redux action producer which adds a user to playlist on the frontend after successfully persisting in the backend.
function addPlaylistUser(user){
    return {type: 'ADD-USER-T0-PLAYLIST', user: user}
}


// fetches to backend to add user to a playlist and dipstaches redux action
function addUserToPlaylist(uri){
    return function(dispatch, getState){
        let userId = getState().currentUser.userId
        let playlistId = getState().copying

        let data = { user_playlist: {user_id: userId, playlist_id: playlistId, add_uri: uri}}
        let obj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        fetch('http://localhost:3000/user_playlists', obj).then(resp => resp.json()).then(data => {console.log(data); 
        if(data.message){

            alert(data.message)
        } 
        if(data.user){

            dispatch(addPlaylistUser(data.user))
        }
    })
    }
}


// fetches members of a playlist which happens upon click to navigate to a specific playlist
function fetchPlaylistMembers(){
  
    return function(dispatch, getState){
        let userId = getState().currentUser.userId
        let playlistId = getState().copying
        
        fetch(`http://localhost:3000/playlists/${playlistId}/${userId}`).then(resp => resp.json()).then(data => {console.log(data); dispatch(setUsers(data))})
    }
}

function setUsers(users){
    return {type: 'SET-USERS', users: users}
}

function clearPUsers(){
    return{type: 'CLEAR'}
}


function setSearchTracks(results){
    return {type: 'SET-SEARCHED-TRACKS', tracks: results}
}

function setSearchAlbums(results){
    return {type: 'SET-SEARCHED-ALBUMS', albums: results}
}

function clearSearchedTracks(){
    return {type: 'CLEAR-SEARCHED-TRACKS'}
}


function deletePlaylist(){

    return function(dispatch, getState){
        let playlistId = getState().copying
        const obj = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch(`http://localhost:3000/playlists/${playlistId}`, obj).then(resp => resp.json()).then(data => {
            console.log(data);
            if (data.message === 'successfully deleted'){
            dispatch(dispatchDeletePlaylist(playlistId))
            } else {
                alert('delete failed, please try again later.')
            }
        })
    }
}

function dispatchDeletePlaylist(id){

    return {type: 'DELETE-PLAYLIST', playlistId: id}
}


export { setUser, logoutUser, setToken, setHome, setBrowse, fetchUserPlaylists, logoutUserFromStorage, fetchPlaylistTracks, setPlaylistPage, setCurrentTracks, setQueueTracks, setPlayPosition, fetchFeaturedPlaylists, fetchSharedPlaylists, playMusic, pauseMusic, makePlaylist, addSong, fetchAddLike, spotifySearch, deleteSong, copying, downToSpotify, updateToSpotify, addUserToPlaylist, fetchPlaylistMembers, clearPUsers, clearSearchedTracks, fetchDislike, deletePlaylist}