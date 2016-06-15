import java.util.List;

public class EasyTreeNode {

	// EasyTree properties
	private String name, id, pos, def, link;
	private List<EasyTreeNode> children, _children;
	// Extra properties for holding CoNLL-X values
	private String cid, lemma, cpos, feats, pdeprel, phead;
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getId() {
		return id;
	}
	
	public void setPos(String pos) {
		this.pos = pos;
	}
	
	public String getPos() {
		return pos;
	}
	
	public void setDef(String def) {
		this.def = def;
	}
	
	public String getDef() {
		return def;
	}
	
	public void setLink(String link) {
		this.link = link;
	}
	
	public String getLink() {
		return link;
	}
	
	public void setChildren(List<EasyTreeNode> children) {
		this.children = children;
	}
	
	public List<EasyTreeNode> getChildren() {
		return children;
	}
	
	public void set_children(List<EasyTreeNode> _children) {
		this._children = _children;
	}
	
	public List<EasyTreeNode> get_children() {
		return _children;
	}
	
	public void setCid(String cid) {
		this.cid = cid;
	}
	
	public String getCid() {
		return this.cid;
	}
	
	public void setLemma(String lemma) {
		this.lemma = lemma;
	}
	
	public String getLemma() {
		return this.lemma;
	}
	
	public void setCpos(String cpos) {
		this.cpos = cpos;
	}
	
	public String getCpos() {
		return cpos;
	}
	
	public void setFeats(String feats) {
		this.feats = feats;
	}
	
	public String getFeats() {
		return this.feats;
	}
	
	public void setPHead(String phead) {
		this.phead = phead;
	}
	
	public String getPHead() {
		return phead;
	}
	
	public void setPDeprel(String pdeprel) {
		this.pdeprel = pdeprel;
	}
	
	public String getPDeprel() {
		return pdeprel;
	}
}
