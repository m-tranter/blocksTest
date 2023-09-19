const template = `<div id="contentTypesContainer"> <h1 v-if="type">{{h1}}</h1> <div v-if="type" class="row events-container"> <div class="col-lg-8"> <nav role="navigation" aria-label="Results data navigation"> <ul class="pagination d-flex flex-wrap mb-2 ms-0"> <li class="page-item" v-bind:class="{disabled: pageIndex===0}"> <button class="page-link" type="button" v-on:click="goToPage(pageIndex)" > Previous </button> </li><li v-for="pagebtn in pageBtns" class="page-item" v-bind:class="{disabled: pageIndex===pagebtn - 1}" v-bind:key="pagebtn" > <button class="page-link" type="button" v-on:click="goToPage(pagebtn)" >{{pagebtn}}</button> </li><li class="page-item" v-bind:class="{disabled: pageIndex + 1===pageCount}" > <button class="page-link" type="button" v-on:click="goToPage(pageIndex + 2)" > Next </button> </li></ul> </nav> <div class="api-results-info"> <p>Total results: <strong>{{totalCount}}</strong></p><p>Current page: <strong>{{pageIndex + 1}}</strong></p></div><div v-for="item in items" v-bind:key="item.sys.id" tabindex="0" class="linkDiv ranger-event-card card card-item flex-md-row align-items-center" > <a :href="item.sys.uri><span class="innerLink" ><span class="visually-hidden">{{item.title}}</span></span ></a > <div class="col-12 col-md-5 thumbnail-container d-flex justify-content-center px-2" > <img v-if="item.image !=null" class="img-fluid rounded featured-img" v-bind:src="prefix(item.image.asset.sys.uri)" v-bind:alt="item.title"/> </div><div class="card-body col-12 col-md-7 text-center text-md-start ps-md-4 ps-xl-2" > <h2 class="fs-4">{{item.entryTitle}}</h2> <template v-if=" formatDate(item.dateStartEnd.from)===formatDate(item.dateStartEnd.to) " > <p>{{formatDate(item.dateStartEnd.from)}}.</p><p> Time:{{getTime(item.dateStartEnd.from)}}-{{getTime(item.dateStartEnd.to)}}. </p></template> <template v-else> <p> From{{getTime(item.dateStartEnd.from)}}on{{formatDate(item.dateStartEnd.from)}}. </p><p> Until{{getTime(item.dateStartEnd.to)}}on{{formatDate(item.dateStartEnd.to)}}. </p></template> <p>{{item.excerpt}}</p></div></div><nav role="navigation" aria-label="Results data navigation"> <ul class="pagination d-flex flex-wrap mb-2 ms-0"> <li class="page-item" v-bind:class="{disabled: pageIndex===0}"> <button class="page-link" type="button" v-on:click="goToPage(pageIndex)" > Previous </button> </li><li v-for="pagebtn in pageBtns" class="page-item" v-bind:class="{disabled: pageIndex===pagebtn - 1}" v-bind:key="pagebtn" > <button class="page-link" type="button" v-on:click="goToPage(pagebtn)" >{{pagebtn}}</button> </li><li class="page-item" v-bind:class="{disabled: pageIndex + 1===pageCount}" > <button class="page-link" type="button" v-on:click="goToPage(pageIndex + 2)" > Next </button> </li></ul> </nav> </div><div class="col-lg-4 mt-3 mt-lg-0"> <div class="search-options-container border-secondary border border-1 rounded p-3" > <h2 class="mt-0">Search for an event</h2> <div class="date-range"> <h3>Date range</h3> <label for="start-date">From</label> <input type="date" id="start-date" v-model="fromDate" min="2022-09-01" max="2025-12-31"/> <label for="end-date">To</label> <input type="date" id="end-date" v-model="toDate" min="2022-09-01" max="2025-12-31" v-on:change="searchFilter()"/> </div><div class="search-options mt-3"> <div class="input-group content-type-search"> <input @input="searchFilter" @focus="clearAlert" autocomplete="off" type="text" class="form-control me-2 border-secondary border border-1" placeholder="Type here..." v-model="searchTerm" aria-label="Search term" id="contentTypeSearchInput"/> <div class="input-group-append"> <button type="button" class="btn btn-outline-secondary" v-on:click="searchFilter" id="contentTypeSearchBtn" > Search </button> </div><button class="btn btn-outline-secondary w-100 mt-3" type="button" v-on:click="resetSearch" > Clear </button> </div><div class="search-error-messages"> <div v-if="searchAlert===true" class="alert alert-secondary mt-2" role="alert" > Please enter a search term. </div></div></div></div><div class="category-options pt=5 mt-5"> <h3 class="mb-3">Or filter events by category</h3> <div class="form-check" v-for="category in categories" v-bind:key="category" > <input class="form-check-input" type="checkbox" v-bind:id="category" v-bind:ref="category" v-bind:checked="categoriesChecked.includes(category)" v-on:change=" ()=>{applyFilters(category);}"/> <label class="form-check-label" v-bind:for="category" >{{category}}</label > </div></div></div></div><div v-if="item.dateStartEnd"> <a href="/blockstest" class="cec-button">Back</a> <h2 class="selected-item-details--title text-center">{{item.title}}</h2> <template v-if=" formatDate(item.dateStartEnd.from)===formatDate(item.dateStartEnd.to) " > <p class="text-center fs-5">{{formatDate(item.dateStartEnd.from)}}.</p></template> <template v-else> <p class="text-center fs-5">{{formatDate(item.dateStartEnd.from)}}to{{formatDate(item.dateStartEnd.to)}}. </p></template> <div class="selected-item-details"> <div class="row"> <div class="col-12"> <img v-if="item.image !=null" class="rounded mx-auto d-block featured-img" v-bind:src="prefix(item.image.asset.sys.uri)" v-bind:alt="item.title"/> <hr/> </div><div class="col-lg-6 pb-lg-2"> <h3>Description</h3> <div class="selected-item-details--description" v-html="item.description" ></div></div><div class="col-lg-6 pb-2"> <h3>Details</h3> <template v-if=" formatDate(item.dateStartEnd.from)===formatDate(item.dateStartEnd.to) " > <p> <strong>Time:</strong>{{getTime(item.dateStartEnd.from)}}-{{getTime(item.dateStartEnd.to)}}. </p></template> <template v-else> <p> <strong>From: </strong>{{getTime(item.dateStartEnd.from)}},{{formatDate(item.dateStartEnd.from)}}. </p><p> <strong>To: </strong>{{getTime(item.dateStartEnd.to)}},{{formatDate(item.dateStartEnd.to)}}. </p></template> <p><strong>Leader(s):</strong>{{item.leaders}}</p><p> <strong>More information:</strong> </p><div v-html="item.eventInformation"></div><p><strong>Tags:</strong></p><ul> <li v-for="tag in item.tags" v-bind:key="tag.key">{{tag.name}}</li></ul> <h3>Meeting point</h3> <div v-html="item.meetingPoint"></div><div class="selected-item-details__map"> <div id="map" ref="mapDiv"> <a target="_blank" v-bind:href="gmap(item)" class="cec-button cec-button-forward" role="button" aria-pressed="true" > Get Directions <small>(opens new window)</small></a > </div></div></div><div class="col-12"> <hr/> <a href="/blockstest" class="cec-button">Back</a> </div></div></div></div></div>`;
export default template;
