import React, { Component } from 'react';
import UASTViewer, { Editor, withUASTEditor } from 'uast-viewer';
import 'uast-viewer/dist/default-theme.css';
import Client, { protoToMap, initLibuast, roleToString } from 'bblfsh';
import './App.css';

const client = new Client('http://127.0.0.1:8080');
const libuast = initLibuast();

function FilteredUast({ filtering, filterErr, uastViewerProps, rootIds }) {
  if (filterErr) {
    return <div>{filterErr.toString()}</div>;
  }

  if (filtering) {
    return <div>filtering...</div>;
  }

  if (uastViewerProps.uast) {
    return <UASTViewer {...uastViewerProps} rootIds={rootIds} />;
  }

  return null;
}

function Layout({
  editorProps,
  uastViewerProps,
  rootIds,
  query,
  filtering,
  filterErr,
  handleParse,
  handleCodeChange,
  handleQueryChange,
  handleFilter
}) {
  return (
    <div className="app">
      <div className="app__left-pane">
        <div>
          <button className="parse-button" onClick={handleParse}>
            Parse
          </button>
        </div>
        <Editor {...editorProps} onChange={handleCodeChange} />
      </div>
      <div className="app__right-pane">
        <div className="filter-box">
          Query{' '}
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
          />
          <button onClick={handleFilter}>Filter</button>
        </div>
        <FilteredUast
          filtering={filtering}
          filterErr={filterErr}
          uastViewerProps={uastViewerProps}
          rootIds={rootIds}
        />
      </div>
    </div>
  );
}

function transformer(mapping, expandLevel, ...hooks) {
  if (!mapping) {
    return null;
  }

  const tree = {};
  let id = 0;

  function convertPos(pos) {
    return {
      Offset: pos.getOffset(),
      Line: pos.getLine(),
      Col: pos.getCol()
    };
  }

  function convertNode(pbNode, level, parentId) {
    const curId = id + 1;
    id = curId;

    const node = {
      id: curId,
      //
      InternalType: pbNode.getInternalType(),
      Properties: pbNode
        .getPropertiesMap()
        .toArray()
        .reduce(
          (acc, [key, value]) => Object.assign(acc, { [key]: value }),
          {}
        ),
      StartPosition: pbNode.hasStartPosition()
        ? convertPos(pbNode.getStartPosition())
        : null,
      EndPosition: pbNode.hasEndPosition()
        ? convertPos(pbNode.getEndPosition())
        : null,
      Roles: pbNode.getRolesList().map(r => roleToString(r)),
      //

      expanded: level < expandLevel,
      parentId
    };

    if (pbNode.getToken()) {
      node.Token = pbNode.getToken();
    }

    node.Children = pbNode
      .getChildrenList()
      .map(n => convertNode(n, level + 1, curId));

    tree[curId] = hooks.reduce((n, hook) => hook(n), node);

    return curId;
  }

  convertNode(mapping[0], 0);

  return tree;
}

const Content = withUASTEditor(Layout, transformer);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      code: 'console.log("test");',
      res: null,
      err: null,
      query: '//*[@roleLiteral]',
      uastMapping: null,
      filtering: false,
      filterResult: null,
      filterErr: null
    };

    this.handleParse = this.handleParse.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentDidMount() {
    this.handleParse();
  }

  handleParse() {
    this.setState({
      res: null,
      uastMapping: null,
      filtering: false,
      filterResult: null,
      filterErr: null,
      err: null
    });

    client
      .parse(this.state.code, '', 'javascript')
      .then(res => {
        const uastMapping = protoToMap(res.getUast());
        this.setState({ res, uastMapping });
      })
      .catch(err => this.setState({ err }));
  }

  handleCodeChange(code) {
    this.setState({ code });
  }

  handleQueryChange(query) {
    this.setState({ query });
  }

  handleFilter() {
    this.setState({ filtering: true, filterResult: null, filterErr: null });

    libuast
      .filter(0, this.state.uastMapping, this.state.query)
      .then(r => this.setState({ filterResult: r }))
      .catch(filterErr => this.setState({ filterErr }))
      .then(() => this.setState({ filtering: false }));
  }

  render() {
    const {
      code,
      res,
      err,
      query,
      uastMapping,
      filtering,
      filterResult,
      filterErr
    } = this.state;

    if (!res && !err) {
      return <div>loading...</div>;
    }

    if (err) {
      return <div>{err.toString()}</div>;
    }

    let rootIds = filterResult || [1];

    return (
      <Content
        code={code}
        languageMode="text/javascript"
        uast={uastMapping}
        rootIds={rootIds}
        query={query}
        filtering={filtering}
        filterErr={filterErr}
        handleParse={this.handleParse}
        handleCodeChange={this.handleCodeChange}
        handleQueryChange={this.handleQueryChange}
        handleFilter={this.handleFilter}
      />
    );
  }
}

export default App;
