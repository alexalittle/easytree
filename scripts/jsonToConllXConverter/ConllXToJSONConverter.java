import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

public class ConllXToJSONConverter {

	public static void main(String[] args) throws Exception {
		if(args.length != 2) {
			System.err.println("Converts from CoNLL-X format to JSON format\nUSAGE: Two arguments expected: <input_file> <output_file>");
			System.exit(0);
		}
		File inputFile = new File(args[0]);
		File outputFile = new File(args[1]);
		
		ObjectMapper om = new ObjectMapper();
		
		BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(inputFile), "UTF-8"));
		PrintWriter writer = new PrintWriter(new OutputStreamWriter(new FileOutputStream(outputFile), "UTF-8"));
		
		String line = null;
		List<EasyTreeNode> nodes = new ArrayList<>();
		Map<String, EasyTreeNode> idToNode = new HashMap<>();
		Map<EasyTreeNode, String> nodeToHead = new HashMap<>();
		StringWriter swriter = new StringWriter();
		while((line = reader.readLine()) != null) {
			line = line.trim();
			if(!line.equals("")) {
				String[] parts = line.split("\\t");
				String id = parts[0];
				String text = parts[1];
				String lemma = parts[2];
				String cpos = parts[3];
				String pos = parts[4];
				String feats = parts[5];
				String head = parts[6];
				String deprel = parts[7];
				String phead = parts[8];
				String pdeprel = parts[9];
				
				EasyTreeNode node = new EasyTreeNode();
				node.setCid(id);
				node.setName(text);
				node.setLemma(lemma);
				node.setCpos(cpos);
				node.setPos(pos);
				node.setFeats(feats);
				//node.setHead(head);
				node.setLink(deprel);
				// Not sure what to do with these
				node.setPHead(phead);
				node.setPDeprel(pdeprel);
				
				idToNode.put(id, node);
				nodes.add(node);
				nodeToHead.put(node, head);
			}
			else {
				if(nodes.size() > 0) {
					EasyTreeNode rootNode = new EasyTreeNode();
					rootNode.setName("root");
					for(EasyTreeNode node : nodes) {
						String head = nodeToHead.get(node);
						if(head != null) {
							EasyTreeNode headNode = head.equals("0") ? rootNode : idToNode.get(head);
							if(headNode.getChildren() == null) headNode.setChildren(new ArrayList<>());
							headNode.getChildren().add(node);
						}
					}
					om.writeValue(swriter, rootNode);
					swriter.write("\n");
				}
				idToNode.clear();
				nodeToHead.clear();
				nodes.clear();
			}
		}
		writer.println(swriter.toString());
		reader.close();
		writer.close();
	}
	
}
