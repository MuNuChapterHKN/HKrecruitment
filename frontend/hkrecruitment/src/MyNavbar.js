import React from 'react';




function MyNavbar() {

    return <nav class="navbar navbar-expand-sm  fixed-top justify-content-between ">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#left-sidebar"
      aria-controls="left-sidebar" aria-expanded="false" aria-label="Toggle sidebar">
      <span class="navbar-toggler-icon"></span>
    </button>
    <a class="navbar-brand" >
      <div>
       <img class="navLogo" href="hkn_logo_blu.png"/>
        <large class="scritta"> HKRecruitment</large>
      </div>
    </a>
    <form class=" form-inline  my-2 my-lg-0">
      <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
    </form>
    <svg class="bi bi-person-circle" width="2em" height="2em" viewBox="0 0 16 16" fill="white"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z" />
      <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
    </svg>
  </nav>


}

export default MyNavbar;
