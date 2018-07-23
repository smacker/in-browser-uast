import React, { Component } from 'react';
import UASTViewer, { Editor, withUASTEditor } from 'uast-viewer';
import 'uast-viewer/dist/default-theme.css';
import Client, { protoToMap, initLibuast, roleToString } from 'bblfsh';
import libuastWasm from 'bblfsh/dist/libuast.wasm';
import './App.css';

const client = new Client('http://127.0.0.1:8080');
const libuast = initLibuast({
  locateFile(path) {
    if (path.endsWith('.wasm')) {
      return libuastWasm;
    }
    return path;
  }
});

const nodeSchema = [
  { name: 'internal_type', attr: n => n.pbNode.getInternalType() },
  {
    name: 'properties',
    type: 'object',
    attr: n =>
      n.pbNode
        .getPropertiesMap()
        .toArray()
        .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {})
  },
  { name: 'token', attr: n => n.pbNode.getToken() },
  { name: 'start_position', type: 'location', attr: n => n.StartPosition },
  { name: 'end_position', type: 'location', attr: n => n.EndPosition },
  {
    name: 'roles',
    type: 'array',
    label: '[]Role',
    attr: n => n.pbNode.getRolesList().map(r => roleToString(r))
  }
];

function FilteredUast({ filtering, filterErr, uastViewerProps, rootIds }) {
  if (filterErr) {
    return <div>{filterErr.toString()}</div>;
  }

  if (filtering) {
    return <div>filtering...</div>;
  }

  if (uastViewerProps.uast) {
    return (
      <UASTViewer {...uastViewerProps} rootIds={rootIds} schema={nodeSchema} />
    );
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
      pbNode,
      StartPosition: pbNode.hasStartPosition()
        ? convertPos(pbNode.getStartPosition())
        : null,
      EndPosition: pbNode.hasEndPosition()
        ? convertPos(pbNode.getEndPosition())
        : null,
      expanded: level < expandLevel,
      parentId
    };

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

    let rootIds = (filterResult || []).map(i => i + 1);

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
