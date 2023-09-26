const entryTemplate = `
  <div>
  <a href="/rangerevents/listing" class="cec-button cec-button--back">Back</a>
  <h2 class="selected-item-details--title text-center">{{item.title}}</h2>
  <template v-if="item.startDate === item.endDate">
    <p class="text-center fs-5">{{item.startDate}}.</p></template
  >
  <template v-else>
    <p class="text-center fs-5">
      {{item.startDate}} to {{item.endDate}}.
    </p></template
  >
  <div class="selected-item-details">
    <div class="row">
      <div class="col-12">
        <img
          v-if="item.image !=null"
          class="rounded mx-auto d-block featured-img"
          v-bind:src="prefix(item.image.asset.sys.uri)"
          v-bind:alt="item.title"
        />
        <hr />
      </div>
      <div class="col-lg-6 pb-lg-2">
        <h3>Description</h3>
        <div
          class="selected-item-details--description"
          v-html="item.description"
        ></div>
      </div>
      <div class="col-lg-6 pb-2">
        <h3>Details</h3>
        <template v-if="item.startDate === item.endDate">
          <p>
            <strong>Time: </strong>{{item.startTime}}&nbsp;-{{item.endTime}}.
          </p></template
        >
        <template v-else>
          <p><strong>From:</strong>{{item.startTime}}, {{item.startDate}}.</p>
          <p>
            <strong>To:</strong>{{item.endTime}}, {{item.endDate}}.
          </p></template
        >
        <p><strong>Leader(s): </strong>{{item.leaders}}</p>
        <p class="mb-0"><strong>More information:</strong></p>
        <div v-html="item.eventInformation"></div>
        <p class="mb-0"><strong>Tags:</strong></p>
        <ul>
          <li v-for="tag in item.tags" v-bind:key="tag.key">{{tag}}</li>
        </ul>
        <h3>Meeting point</h3>
        <div v-html="item.meetingPoint"></div>
        <div class="selected-item-details__map">
          <div id="map" ref="mapDiv">
            <a
              target="_blank"
              v-bind:href="gmap(item)"
              class="cec-button cec-button-forward"
              role="button"
              aria-pressed="true"
            >
              Get Directions <small>(opens new window)</small></a
            >
          </div>
        </div>
      </div>
      <div class="col-12">
        <hr />
        <a href="/rangerevents/listing" class="cec-button cec-button--back">Back</a>
      </div>
    </div>
  </div>
</div>
  `;

export default entryTemplate;
