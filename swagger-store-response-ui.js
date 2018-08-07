// State namespace for this plugin
const STORE_STATE_KEY = 'localHistory';

/**
 * Formats responses nicely.
 * Will stringify the body or error value within the map.
 * Could also be updated to deal with formatting things like XML if desired.
 * Falls back to returning the full response in error case.
 * @param {Map} response the response
 */
const prettifyResponse = (response) => {
  try {
    return JSON.stringify(response.get('body') || response.get('err'), null, ' ');
  } catch (err) {
    // Will return normal response if cannot prettify it
  }
  return response;
};

const DisplayResponsesStandaloneLayoutPlugin = () => ({
  components: {
    // Overrides StandaloneLayout to add the ResponsesComponent at the bottom of the page.
    DisplayResponsesStandaloneLayout: (props) => {
      const {
        getComponent,
      } = props;

      const BaseLayout = getComponent('StandaloneLayout', true);
      const ResponsesComponent = getComponent('Responses');
      return (
        <div>
          <BaseLayout />
          <div>
            &nbsp;
          </div>
          <ResponsesComponent {...props} />
        </div>
      );
    },
    // Renders a previously saved response.
    SavedResponse: (props) => {
      const { getComponent, response, onClickClearResponse } = props;
      const HighlightCode = getComponent('highlightCode');
      const ModelCollapse = getComponent('ModelCollapse');
      const Button = getComponent('Button');

      const Row = getComponent('Row');
      const Col = getComponent('Col');

      const title = `${response.get('method')} ${response.get('path')}`;
      const collapsedContent = `@ ${new Date(response.get('time')).toLocaleString()} `;
      const responseValue = prettifyResponse(response);

      return (
        <div className="model-container b">
          <div>
            <ModelCollapse title={title} collapsedContent={collapsedContent}>
              <HighlightCode value={responseValue} />
            </ModelCollapse>
            <div className="pt2">
              <Button className="btn" onClick={onClickClearResponse}>
                Remove
                </Button>
            </div>
          </div>
        </div>);
    },
    // Represents a Collection of Responses.
    Responses: (props) => {
      const {
        getComponent, layoutActions, layoutSelectors,
        [`${STORE_STATE_KEY}Selectors`]: prevResponsesSelectors,
        [`${STORE_STATE_KEY}Actions`]: prevResponsesActions
      } = props;
      const Button = getComponent('Button');
      const Row = getComponent('Row');
      const Col = getComponent('Col');
      const Container = getComponent('Container');
      const Collapse = getComponent('Collapse');
      const SavedResponse = getComponent('SavedResponse');

      const shownKey = 'expand-local-history';

      const previousResponses = prevResponsesSelectors.previousResponses();
      const isExpanded = layoutSelectors.isShown(shownKey);
      const responsesToRender = previousResponses.map(response => (
        <SavedResponse
          key={response.get('time')}
          response={response}
          onClickClearResponse={() => prevResponsesActions.clearResponse(response)}
          getComponent={getComponent}
        />
      ));

      const clearAllButton = previousResponses.size === 0 ? null : (
        <Button
          className="btn"
          onClick={(e) => {
            e.stopPropagation();
            prevResponsesActions.clearAllResponses();
          }}
        >
          Clear All
        </Button>
      );
      return (
        <Container className="swagger-ui">
          <Row>
            <Col>
              <section className={isExpanded ? "models is-open" : "models"}>
                <h4 onClick={() => layoutActions.show(shownKey, !isExpanded)}>
                  <span>
                    Previous Local Responses
                  </span>
                  {clearAllButton}
                  <Button className="expand-operation">
                    <svg width="20" height="20">
                      <use xlinkHref={isExpanded ? "#large-arrow-down" : "#large-arrow"} />
                    </svg>
                  </Button>
                </h4>
                <Collapse isOpened={isExpanded} animated>
                  {responsesToRender}
                </Collapse>
              </section>
            </Col>
          </Row>
        </Container>);
    },
  },
});